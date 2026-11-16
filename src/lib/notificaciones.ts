import { prisma } from "./prisma";

export interface CrearNotificacionParams {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  enlace: string;
  tipo?: "INFO" | "CAMBIO_ESTADO" | "NUEVA_SOLICITUD" | "NUEVO_COMENTARIO";
}

export async function crearNotificacion({
  usuarioId,
  titulo,
  mensaje,
  enlace,
  tipo = "INFO",
}: CrearNotificacionParams) {
  try {
    return await prisma.notificacion.create({
      data: {
        usuarioId,
        titulo,
        mensaje,
        enlace,
        tipo,
        leida: false,
      },
    });
  } catch (error) {
    console.error("Error al crear notificación individual:", error);
    return null;
  }
}

export async function notificarAdmins({
  titulo,
  mensaje,
  enlace,
  tipo = "INFO",
}: Omit<CrearNotificacionParams, "usuarioId">) {
  try {
    const admins = await prisma.usuario.findMany({
      where: { rol: "ADMIN", activo: true },
      select: { id: true },
    });

    if (admins.length === 0) return [];

    const notificacionesData = admins.map((admin) => ({
      usuarioId: admin.id,
      titulo,
      mensaje,
      enlace,
      tipo,
      leida: false,
    }));

    await prisma.notificacion.createMany({
      data: notificacionesData,
    });

    return admins;
  } catch (error) {
    console.error("Error al notificar a los administradores:", error);
    return [];
  }
}
