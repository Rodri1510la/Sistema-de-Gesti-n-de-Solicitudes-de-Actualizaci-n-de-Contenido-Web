import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function formatDate(value: Date, includeTime = false) {
  return includeTime
    ? value.toLocaleString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Lima",
      })
    : value.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
      });
}

function addSection(doc: PDFKit.PDFDocument, title: string) {
  if (doc.y + 38 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  const y = doc.y;
  doc.save().roundedRect(48, y, 499, 24, 3).fill("#e9ebf5").restore();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#2d366f")
    .text(title.toUpperCase(), 57, y + 7, { width: 481 });
  doc.y = y + 34;
}

function addField(doc: PDFKit.PDFDocument, label: string, value: string) {
  if (doc.y + 42 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#334155").text(label);
  doc.moveDown(0.15);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#0f172a")
    .text(value, { width: 499, lineGap: 3 });
  doc.moveDown(0.7);
}

function addSignatures(doc: PDFKit.PDFDocument, solicitante: string, departamento: string) {
  const boxHeight = 112;
  if (doc.y + boxHeight + 20 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  const boxWidth = 238;
  const gap = 23;
  const left = 48;
  const right = left + boxWidth + gap;
  const top = doc.y + 12;

  for (const x of [left, right]) {
    doc.save().roundedRect(x, top, boxWidth, boxHeight, 4).lineWidth(1).stroke("#94a3b8").restore();
    doc
      .moveTo(x + 24, top + 64)
      .lineTo(x + boxWidth - 24, top + 64)
      .lineWidth(0.8)
      .stroke("#475569");
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#0f172a")
    .text("JEFATURA DE TEIN", left + 10, top + 10, { width: boxWidth - 20, align: "center" })
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#475569")
    .text("Tecnologías de la Información - UPT", left + 10, top + 25, {
      width: boxWidth - 20,
      align: "center",
    })
    .text("Firma y sello", left + 10, top + 75, { width: boxWidth - 20, align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#0f172a")
    .text(solicitante, right + 10, top + 10, { width: boxWidth - 20, align: "center" })
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#475569")
    .text(`DECANO / DIRECTOR SOLICITANTE - ${departamento}`, right + 10, top + 25, {
      width: boxWidth - 20,
      align: "center",
      height: 30,
    })
    .text("Firma y sello", right + 10, top + 75, { width: boxWidth - 20, align: "center" });
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
    const solicitudId = Number.parseInt(id, 10);
    if (!Number.isInteger(solicitudId) || solicitudId < 1) {
      return NextResponse.json({ error: "ID de solicitud no válido" }, { status: 400 });
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: {
        solicitante: {
          select: { id: true, nombre: true, email: true, departamento: true },
        },
        historiales: {
          where: { estadoNuevo: "COMPLETADO" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    if (user.rol !== "ADMIN" && solicitud.solicitanteId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para descargar el acta de esta solicitud" },
        { status: 403 }
      );
    }

    if (solicitud.estado !== "COMPLETADO" || !solicitud.fechaCompletado) {
      return NextResponse.json(
        { error: "El acta estará disponible cuando la solicitud esté completada" },
        { status: 409 }
      );
    }

    const doc = new PDFDocument({ size: "A4", margins: { top: 48, bottom: 48, left: 48, right: 48 } });
    const pdfBytes = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.once("end", () => resolve(Buffer.concat(chunks)));
      doc.once("error", reject);

      doc.info.Title = `Acta de Conformidad ${solicitud.codigo}`;
      doc.info.Author = "Sistema de Gestión de Solicitudes de Actualización Web - UPT";

      const headerY = 48;
      doc.image(path.join(process.cwd(), "public", "upt_logo.png"), 48, headerY - 6, {
        fit: [54, 64],
        align: "center",
        valign: "center",
      });
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#2d366f")
        .text("UNIVERSIDAD PRIVADA DE TACNA", 114, headerY + 2, { width: 300 });
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#334155")
        .text("OFICINA DE TECNOLOGÍAS DE LA INFORMACIÓN (TEIN)", 114, headerY + 22, {
          width: 350,
        });
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#64748b")
        .text("Área de Desarrollo y Administración de Portales Web Institucionales", 114, headerY + 37, {
          width: 350,
        });

      doc.moveTo(48, 108).lineTo(547, 108).lineWidth(1.5).stroke("#2d366f");
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#17345c")
        .text(`ACTA-${solicitud.codigo}`, 48, 117, { width: 499, align: "right" });
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#0f172a")
        .text("ACTA DE CONFORMIDAD Y FICHA TÉCNICA", 48, 138, {
          width: 499,
          align: "center",
        });
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#475569")
        .text("Constancia de atención y publicación de actualización de contenido web institucional", 48, 160, {
          width: 499,
          align: "center",
        });
      doc.y = 190;

      addSection(doc, "I. Datos generales de la solicitud");
      addField(doc, "Código único", solicitud.codigo);
      addField(doc, "Fecha de solicitud", formatDate(solicitud.createdAt, true));
      addField(doc, "Fecha de publicación en el portal", formatDate(solicitud.fechaCompletado!));
      addField(doc, "Dependencia solicitante", solicitud.solicitante.departamento);
      addField(
        doc,
        "Responsable solicitante",
        `${solicitud.solicitante.nombre} (${solicitud.solicitante.email})`
      );

      addSection(doc, "II. Detalle técnico de la actualización");
      addField(doc, "Título del requerimiento", solicitud.titulo);
      addField(doc, "Sección web intervenida", solicitud.seccionPortal);
      addField(doc, "Detalle registrado al cierre y publicación", solicitud.historiales[0]?.comentario?.trim() || "Sin detalle de cierre registrado.");

      addSection(doc, "III. Conformidad");
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#334155")
        .text(
          "En señal de conformidad con la actualización de contenido web indicada, suscriben los representantes de la Oficina TEIN y del área solicitante.",
          { width: 499, lineGap: 3 }
        );
      addSignatures(doc, solicitud.solicitante.nombre, solicitud.solicitante.departamento);

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#94a3b8")
        .text(
          "Documento generado por el Sistema de Gestión de Solicitudes de Actualización Web (SGSACW) - Universidad Privada de Tacna",
          48,
          doc.page.height - 38,
          { width: 499, align: "center" }
        );
      doc.end();
    });

    const filename = `acta-${solicitud.codigo.toLowerCase()}.pdf`;
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Error al generar acta de conformidad:", error);
    return NextResponse.json({ error: "No se pudo generar el acta de conformidad" }, { status: 500 });
  }
}
