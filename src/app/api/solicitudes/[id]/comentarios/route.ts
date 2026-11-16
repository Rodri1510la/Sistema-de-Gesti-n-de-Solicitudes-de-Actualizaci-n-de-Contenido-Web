import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crearNotificacion, notificarAdmins } from "@/lib/notificaciones";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const solicitudId = parseInt(id, 10);

    if (isNaN(solicitudId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { comentario } = body;

    if (!comentario || !comentario.trim()) {
      return NextResponse.json(
        { error: "El comentario no puede estar vacío" },
        { status: 400 }
      );
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: { solicitante: true },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Verificar permisos: solo ADMIN o el dueño de la solicitud pueden comentar
    if (user.rol !== "ADMIN" && solicitud.solicitanteId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para comentar en este requerimiento" },
        { status: 403 }
      );
    }

    // Crear registro en el historial como comentario
    const nuevoHistorial = await prisma.historial.create({
      data: {
        solicitudId,
        usuarioId: user.id,
        accion: "COMENTARIO",
        comentario: comentario.trim(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            rol: true,
            departamento: true,
          },
        },
      },
    });

    // Enviar notificación a la contraparte
    if (user.rol === "ADMIN") {
      // TEIN comentó -> Notificar al solicitante
      await crearNotificacion({
        usuarioId: solicitud.solicitanteId,
        titulo: `Mensaje de TEIN en ${solicitud.codigo}`,
        mensaje: `${user.nombre} agregó una respuesta: "${comentario.trim().substring(0, 80)}${comentario.length > 80 ? '...' : ''}"`,
        enlace: `/solicitudes/${solicitud.id}`,
        tipo: "NUEVO_COMENTARIO",
      });
    } else {
      // Solicitante comentó -> Notificar a todos los administradores de TEIN
      await notificarAdmins({
        titulo: `Respuesta de ${user.departamento}`,
        mensaje: `${user.nombre} comentó en la solicitud ${solicitud.codigo}: "${comentario.trim().substring(0, 80)}${comentario.length > 80 ? '...' : ''}"`,
        enlace: `/solicitudes/${solicitud.id}`,
        tipo: "NUEVO_COMENTARIO",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Comentario registrado con éxito",
      historial: nuevoHistorial,
    });
  } catch (error) {
    console.error("Error al registrar comentario:", error);
    return NextResponse.json(
      { error: "Error interno al guardar el comentario" },
      { status: 500 }
    );
  }
}
