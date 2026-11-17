import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Tipos que el navegador puede mostrar en línea (visor/iframe/img)
const INLINE_PREFIXES = ["image/", "application/pdf", "text/plain"];

function contentDisposition(tipoMime: string, nombre: string) {
  const ascii = nombre.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(nombre);
  const tipo = INLINE_PREFIXES.some((prefix) => tipoMime.startsWith(prefix))
    ? "inline"
    : "attachment";

  return `${tipo}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const archivoId = Number.parseInt(id, 10);
    if (!Number.isInteger(archivoId) || archivoId < 1) {
      return NextResponse.json({ error: "ID de archivo no válido" }, { status: 400 });
    }

    const archivo = await prisma.archivo.findUnique({
      where: { id: archivoId },
      include: { solicitud: { select: { solicitanteId: true } } },
    });

    if (!archivo) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // Solo el ADMIN o el dueño de la solicitud pueden descargar el adjunto
    if (user.rol !== "ADMIN" && archivo.solicitud.solicitanteId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para descargar este archivo" },
        { status: 403 }
      );
    }

    let contenido: Uint8Array | null = archivo.contenido
      ? new Uint8Array(archivo.contenido)
      : null;

    // Compatibilidad con adjuntos antiguos guardados en public/uploads
    if (!contenido && archivo.ruta.startsWith("/uploads/")) {
      try {
        const buffer = await readFile(
          path.join(process.cwd(), "public", archivo.ruta.replace(/^\/+/, ""))
        );
        contenido = new Uint8Array(buffer);
      } catch {
        contenido = null;
      }
    }

    if (!contenido) {
      return NextResponse.json(
        { error: "El archivo ya no está disponible" },
        { status: 404 }
      );
    }

    const tipoMime = archivo.tipoMime || "application/octet-stream";
    const cuerpo = contenido.buffer.slice(
      contenido.byteOffset,
      contenido.byteOffset + contenido.byteLength
    ) as ArrayBuffer;

    return new NextResponse(cuerpo, {
      headers: {
        "Content-Type": tipoMime,
        "Content-Length": String(contenido.length),
        "Content-Disposition": contentDisposition(tipoMime, archivo.nombreOriginal),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    return NextResponse.json(
      { error: "Error interno al obtener el archivo" },
      { status: 500 }
    );
  }
}
