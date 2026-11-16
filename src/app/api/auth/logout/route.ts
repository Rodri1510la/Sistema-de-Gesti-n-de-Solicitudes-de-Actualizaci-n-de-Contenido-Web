import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Sesión cerrada correctamente" });

  response.cookies.set({
    name: "sgsacw_session",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
