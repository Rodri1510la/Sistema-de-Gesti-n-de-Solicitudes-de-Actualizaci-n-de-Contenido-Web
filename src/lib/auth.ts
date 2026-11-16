import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "upt-tein-sgsacw-secret-key-2026";

export interface TokenPayload {
  userId: number;
  email: string;
  rol: string;
  nombre: string;
  departamento: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sgsacw_session")?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        departamento: true,
        activo: true,
      },
    });

    if (!user || !user.activo) return null;
    return user;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
}
