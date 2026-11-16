import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      return NextResponse.json({ error: "Acceso restringido a administradores" }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        departamento: true,
        activo: true,
        createdAt: true,
        _count: {
          select: { solicitudes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return NextResponse.json(
      { error: "Error interno al consultar usuarios" },
      { status: 500 }
    );
  }
}
