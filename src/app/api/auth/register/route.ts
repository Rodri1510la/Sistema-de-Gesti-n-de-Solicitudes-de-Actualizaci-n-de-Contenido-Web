import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { nombre, email, password, departamento } = await request.json();

    if (!nombre || !email || !password || !departamento) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const emailNormalizado = email.toLowerCase().trim();

    const existente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (existente) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: emailNormalizado,
        password: hashedPassword,
        rol: "SOLICITANTE",
        departamento: departamento.trim(),
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        departamento: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado con éxito. Ya puede iniciar sesión.",
        usuario: nuevoUsuario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el registro" },
      { status: 500 }
    );
  }
}
