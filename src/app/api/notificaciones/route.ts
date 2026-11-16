import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [notificaciones, unreadCount] = await Promise.all([
      prisma.notificacion.findMany({
        where: { usuarioId: user.id },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.notificacion.count({
        where: { usuarioId: user.id, leida: false },
      }),
    ]);

    return NextResponse.json({
      notificaciones,
      unreadCount,
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al consultar notificaciones" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, all } = body;

    if (all) {
      await prisma.notificacion.updateMany({
        where: { usuarioId: user.id, leida: false },
        data: { leida: true },
      });
      return NextResponse.json({ success: true, message: "Todas las notificaciones marcadas como leídas" });
    }

    if (id) {
      await prisma.notificacion.update({
        where: { id: Number(id), usuarioId: user.id },
        data: { leida: true },
      });
      return NextResponse.json({ success: true, message: "Notificación marcada como leída" });
    }

    return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
  } catch (error) {
    console.error("Error al actualizar notificaciones:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado de notificación" },
      { status: 500 }
    );
  }
}
