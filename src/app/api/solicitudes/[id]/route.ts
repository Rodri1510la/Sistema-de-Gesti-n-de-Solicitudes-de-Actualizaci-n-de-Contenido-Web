import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crearNotificacion } from "@/lib/notificaciones";


// GET /api/solicitudes/[id]
export async function GET(
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
      return NextResponse.json({ error: "ID de solicitud no válido" }, { status: 400 });
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: {
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: true,
            rol: true,
          },
        },
        archivos: true,
        historiales: {
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
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Si es solicitante, verificar que sea el dueño de la solicitud
    if (user.rol === "SOLICITANTE" && solicitud.solicitanteId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta solicitud" },
        { status: 403 }
      );
    }

    return NextResponse.json({ solicitud });
  } catch (error) {
    console.error("Error al obtener detalle de solicitud:", error);
    return NextResponse.json(
      { error: "Error interno al consultar la solicitud" },
      { status: 500 }
    );
  }
}

// PATCH /api/solicitudes/[id] - Cambiar estado o agregar notas
export async function PATCH(
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
    const body = await request.json();
    const { nuevoEstado, comentario, prioridad } = body;

    const solicitudExistente = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitudExistente) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Solo ADMIN puede cambiar de estado (excepto si el solicitante cancela una solicitud pendiente)
    if (user.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo el personal de TEIN (Administrador) puede actualizar el estado de las solicitudes" },
        { status: 403 }
      );
    }

    const estadoAnterior = solicitudExistente.estado;
    const datosActualizacion: any = {};

    if (nuevoEstado && nuevoEstado !== estadoAnterior) {
      datosActualizacion.estado = nuevoEstado;
      if (nuevoEstado === "COMPLETADO") {
        datosActualizacion.fechaCompletado = new Date();
      }
    }

    if (prioridad) {
      datosActualizacion.prioridad = prioridad;
    }

    // Registrar en historial si hay cambio de estado o comentario
    const tieneCambioEstado = nuevoEstado && nuevoEstado !== estadoAnterior;

    const solicitudActualizada = await prisma.$transaction(async (tx) => {
      const updated = await tx.solicitud.update({
        where: { id: solicitudId },
        data: datosActualizacion,
      });

      if (tieneCambioEstado || comentario) {
        await tx.historial.create({
          data: {
            solicitudId,
            usuarioId: user.id,
            accion: tieneCambioEstado ? "CAMBIO_ESTADO" : "COMENTARIO",
            estadoAnterior: tieneCambioEstado ? estadoAnterior : null,
            estadoNuevo: tieneCambioEstado ? nuevoEstado : null,
            comentario: comentario || (tieneCambioEstado ? `Estado actualizado a ${nuevoEstado}` : ""),
          },
        });
      }

      return updated;
    });

    if (tieneCambioEstado) {
      await crearNotificacion({
        usuarioId: solicitudExistente.solicitanteId,
        titulo: `Estado actualizado: ${nuevoEstado}`,
        mensaje: `TEIN cambió el estado de tu requerimiento ${solicitudExistente.codigo} a "${nuevoEstado}"${comentario ? ': "' + comentario + '"' : '.'}`,
        enlace: `/solicitudes/${solicitudId}`,
        tipo: "CAMBIO_ESTADO",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Solicitud actualizada correctamente",
      solicitud: solicitudActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar la solicitud" },
      { status: 500 }
    );
  }
}
