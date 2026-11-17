import { NextResponse } from "next/server";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificarAdmins } from "@/lib/notificaciones";

// GET /api/solicitudes
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado") || "";
    const prioridad = searchParams.get("prioridad") || "";
    const departamento = searchParams.get("departamento") || "";

    // Construir filtro
    const whereClause: any = {};

    // Si es solicitante, solo ve sus propias solicitudes
    if (user.rol === "SOLICITANTE") {
      whereClause.solicitanteId = user.id;
    } else if (departamento) {
      whereClause.solicitante = {
        departamento: {
          contains: departamento,
        },
      };
    }

    if (estado && estado !== "TODOS") {
      whereClause.estado = estado;
    }

    if (prioridad && prioridad !== "TODAS") {
      whereClause.prioridad = prioridad;
    }

    if (search.trim()) {
      whereClause.OR = [
        { titulo: { contains: search } },
        { descripcion: { contains: search } },
        { codigo: { contains: search } },
        { seccionPortal: { contains: search } },
      ];
    }

    const [solicitudes, totalCount, pendientesCount, enProcesoCount, completadasCount] =
      await Promise.all([
        prisma.solicitud.findMany({
          where: whereClause,
          include: {
            solicitante: {
              select: {
                id: true,
                nombre: true,
                departamento: true,
                email: true,
              },
            },
            archivos: {
              select: {
                id: true,
                nombreOriginal: true,
                nombreGuardado: true,
                ruta: true,
                tipoMime: true,
                tamano: true,
                createdAt: true,
              },
            },
            _count: {
              select: { historiales: true, archivos: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        // Contadores para el dashboard
        prisma.solicitud.count({
          where: user.rol === "SOLICITANTE" ? { solicitanteId: user.id } : {},
        }),
        prisma.solicitud.count({
          where: {
            estado: "PENDIENTE",
            ...(user.rol === "SOLICITANTE" ? { solicitanteId: user.id } : {}),
          },
        }),
        prisma.solicitud.count({
          where: {
            estado: { in: ["EN_REVISION", "EN_PROCESO"] },
            ...(user.rol === "SOLICITANTE" ? { solicitanteId: user.id } : {}),
          },
        }),
        prisma.solicitud.count({
          where: {
            estado: "COMPLETADO",
            ...(user.rol === "SOLICITANTE" ? { solicitanteId: user.id } : {}),
          },
        }),
      ]);

    return NextResponse.json({
      solicitudes,
      stats: {
        total: totalCount,
        pendientes: pendientesCount,
        enProceso: enProcesoCount,
        completadas: completadasCount,
      },
    });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json(
      { error: "Error interno al consultar solicitudes" },
      { status: 500 }
    );
  }
}

// POST /api/solicitudes
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const seccionPortal = formData.get("seccionPortal") as string;
    const prioridad = (formData.get("prioridad") as string) || "MEDIA";
    const files = formData.getAll("archivos") as File[];

    if (!titulo || !descripcion || !seccionPortal) {
      return NextResponse.json(
        { error: "El título, la descripción y la sección del portal son obligatorios" },
        { status: 400 }
      );
    }

    // Generar código único para la solicitud: SOL-AÑO-NUMERO
    const anioActual = new Date().getFullYear();
    const countTotal = await prisma.solicitud.count();
    const numeroSecuencia = String(countTotal + 1).padStart(3, "0");
    const codigo = `SOL-${anioActual}-${numeroSecuencia}`;

    // Carpeta lógica de subida. El contenido se guarda en la base de datos para
    // que los adjuntos funcionen también en despliegues serverless (Vercel).
    const archivosData: Array<{
      nombreOriginal: string;
      nombreGuardado: string;
      ruta: string;
      contenido: Uint8Array<ArrayBuffer>;
      tipoMime: string;
      tamano: number;
    }> = [];

    // Procesar archivos subidos
    for (const file of files) {
      if (!file || typeof file === "string" || file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer.byteLength);
      buffer.set(new Uint8Array(arrayBuffer));
      const ext = path.extname(file.name);
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

      archivosData.push({
        nombreOriginal: file.name,
        nombreGuardado: safeName,
        ruta: "", // se completa con /api/archivos/{id} después de crear el registro
        contenido: buffer,
        tipoMime: file.type || "application/octet-stream",
        tamano: file.size,
      });
    }

    // Crear la solicitud en base de datos con su primer registro en el historial
    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        codigo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        seccionPortal: seccionPortal.trim(),
        prioridad,
        estado: "PENDIENTE",
        solicitanteId: user.id,
        archivos: {
          create: archivosData,
        },
        historiales: {
          create: {
            accion: "CREACION",
            estadoNuevo: "PENDIENTE",
            comentario: `Solicitud registrada con ${archivosData.length} archivo(s) adjunto(s).`,
            usuarioId: user.id,
          },
        },
      },
      include: {
        archivos: {
          select: {
            id: true,
            nombreOriginal: true,
            nombreGuardado: true,
            ruta: true,
            tipoMime: true,
            tamano: true,
            createdAt: true,
          },
        },
        solicitante: {
          select: { nombre: true, departamento: true, email: true },
        },
      },
    });

    // Cada adjunto se sirve desde /api/archivos/{id} (contenido guardado en la BD)
    if (nuevaSolicitud.archivos.length > 0) {
      await prisma.$transaction(
        nuevaSolicitud.archivos.map((archivo) =>
          prisma.archivo.update({
            where: { id: archivo.id },
            data: { ruta: `/api/archivos/${archivo.id}` },
          })
        )
      );

      for (const archivo of nuevaSolicitud.archivos) {
        archivo.ruta = `/api/archivos/${archivo.id}`;
      }
    }

    // Notificar a administradores de TEIN sobre el nuevo requerimiento
    await notificarAdmins({
      titulo: `Nueva solicitud ${codigo}`,
      mensaje: `${user.departamento} envió: "${titulo.trim().substring(0, 70)}${titulo.length > 70 ? '...' : ''}"`,
      enlace: `/solicitudes/${nuevaSolicitud.id}`,
      tipo: "NUEVA_SOLICITUD",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Solicitud registrada correctamente",
        solicitud: nuevaSolicitud,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud" },
      { status: 500 }
    );
  }
}
