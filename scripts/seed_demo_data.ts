import { loadEnvConfig } from "@next/env";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const connectionUrl = process.env.DIRECT_URL;
if (!connectionUrl) {
  throw new Error("DIRECT_URL es obligatorio para cargar datos de demostración.");
}

const databaseHost = new URL(connectionUrl).hostname;
if (!databaseHost.endsWith(".pooler.supabase.com")) {
  throw new Error("La carga de demostración solo se permite contra un pooler de Supabase.");
}

const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } },
});

const demoSolicitudes = [
  {
    titulo: "Publicación de comunicado institucional",
    descripcion: "Publicar un comunicado informativo en el portal institucional.",
    seccionPortal: "Portal Institucional > Noticias",
    prioridad: "MEDIA",
    estado: "PENDIENTE",
  },
  {
    titulo: "Actualización de calendario académico",
    descripcion: "Reemplazar las fechas del calendario académico con el cronograma aprobado.",
    seccionPortal: "Portal Académico > Calendario",
    prioridad: "ALTA",
    estado: "PENDIENTE",
  },
  {
    titulo: "Corrección de datos de contacto",
    descripcion: "Actualizar teléfonos y horario de atención de la dependencia.",
    seccionPortal: "Directorio Institucional > Contacto",
    prioridad: "BAJA",
    estado: "EN_REVISION",
  },
  {
    titulo: "Renovación de banner de campaña",
    descripcion: "Revisar el banner y el texto alternativo enviados para una campaña institucional.",
    seccionPortal: "Portal Institucional > Banners",
    prioridad: "URGENTE",
    estado: "EN_REVISION",
  },
  {
    titulo: "Actualización de requisitos de trámite",
    descripcion: "Actualizar la lista de requisitos y pasos de un trámite institucional.",
    seccionPortal: "Servicios > Trámites",
    prioridad: "MEDIA",
    estado: "EN_PROCESO",
  },
  {
    titulo: "Publicación de convocatoria",
    descripcion: "Cargar la convocatoria vigente y sus fechas principales.",
    seccionPortal: "Convocatorias > Vigentes",
    prioridad: "ALTA",
    estado: "EN_PROCESO",
  },
  {
    titulo: "Actualización de plan curricular publicado",
    descripcion: "Publicar la versión aprobada del plan curricular.",
    seccionPortal: "FAING > Escuela Profesional > Plan Curricular",
    prioridad: "ALTA",
    estado: "COMPLETADO",
  },
  {
    titulo: "Publicación de cronograma de admisión",
    descripcion: "Publicar el cronograma de admisión y validar su visualización en móvil.",
    seccionPortal: "Admisión > Cronograma",
    prioridad: "URGENTE",
    estado: "COMPLETADO",
  },
  {
    titulo: "Solicitud devuelta por información incompleta",
    descripcion: "El requerimiento necesita completar sus datos antes de ser atendido.",
    seccionPortal: "Portal Institucional > Información",
    prioridad: "BAJA",
    estado: "RECHAZADO",
  },
  {
    titulo: "Imagen sin resolución adecuada",
    descripcion: "El material adjunto no cumple con los requisitos mínimos solicitados.",
    seccionPortal: "Portal Institucional > Galería",
    prioridad: "MEDIA",
    estado: "RECHAZADO",
  },
] as const;

const stateComments: Record<string, string> = {
  EN_REVISION: "El equipo TEIN está revisando el contenido y los materiales recibidos.",
  EN_PROCESO: "Se inició la actualización en el portal institucional.",
  COMPLETADO: "Los cambios fueron implementados, revisados y publicados en el portal.",
  RECHAZADO: "La solicitud requiere subsanar las observaciones indicadas antes de continuar.",
};

const stateTitles: Record<string, string> = {
  EN_REVISION: "Solicitud en revisión",
  EN_PROCESO: "Solicitud en proceso",
  COMPLETADO: "Solicitud completada",
  RECHAZADO: "Solicitud rechazada",
};

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function createDemoPdf() {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 56, bottom: 56, left: 56, right: 56 } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.once("end", () => resolve(Buffer.concat(chunks)));
    doc.once("error", reject);
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#2d366f")
      .text("ANEXO DE COMUNICADO INSTITUCIONAL");
    doc.moveDown();
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#334155")
      .text("Documento de sustento adjunto a la solicitud de actualización de contenido web.");
    doc.moveDown();
    doc.text("Emitido por la dependencia solicitante.");
    doc.end();
  });
}

async function main() {
  if (process.env.CONFIRM_DEMO_DATA !== "true") {
    throw new Error("Confirma la inserción estableciendo CONFIRM_DEMO_DATA=true.");
  }

  const [admin, solicitantes] = await Promise.all([
    prisma.usuario.findFirst({
      where: { rol: "ADMIN", activo: true },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
    prisma.usuario.findMany({
      where: { rol: "SOLICITANTE", activo: true },
      select: { id: true },
      orderBy: { id: "asc" },
    }),
  ]);

  if (!admin || solicitantes.length === 0) {
    throw new Error("Se necesita al menos una cuenta ADMIN y una cuenta SOLICITANTE activa.");
  }

  const year = new Date().getFullYear();
  const existentes = await prisma.solicitud.findMany({
    where: { codigo: { startsWith: `SOL-${year}-` } },
    select: { codigo: true },
  });
  const usados = new Set(
    existentes
      .map((item) => Number(item.codigo.split("-")[2]))
      .filter((numero) => Number.isFinite(numero))
  );
  let siguiente = 1;
  const codes = demoSolicitudes.map(() => {
    while (usados.has(siguiente)) siguiente += 1;
    const codigo = `SOL-${year}-${String(siguiente).padStart(3, "0")}`;
    usados.add(siguiente);
    siguiente += 1;
    return codigo;
  });

  const existing = await prisma.solicitud.findMany({
    where: { titulo: { in: demoSolicitudes.map((item) => item.titulo) } },
    select: { titulo: true },
  });
  if (existing.length > 0) {
    throw new Error(
      `Ya existen solicitudes con los mismos títulos (${existing.map((item) => item.titulo).join(", ")}); no se insertó nada.`
    );
  }

  const attachmentName = `anexo-comunicado-${Date.now()}.pdf`;
  const attachmentPdf = await createDemoPdf();
  const attachmentBuffer = new Uint8Array(attachmentPdf.byteLength);
  attachmentBuffer.set(new Uint8Array(attachmentPdf));

  const created = await prisma.$transaction(async (tx) => {
      const requests: Array<{
        id: number;
        codigo: string;
        titulo: string;
        estado: string;
        solicitanteId: number;
      }> = [];

      for (let index = 0; index < demoSolicitudes.length; index += 1) {
        const demo = demoSolicitudes[index];
        const code = codes[index];
        const solicitante = solicitantes[index % solicitantes.length];
        const createdAt = daysAgo(16 - index);
        const statePath = ["PENDIENTE"];

        if (demo.estado === "EN_REVISION") statePath.push("EN_REVISION");
        if (demo.estado === "EN_PROCESO" || demo.estado === "COMPLETADO") {
          statePath.push("EN_REVISION", "EN_PROCESO");
        }
        if (demo.estado === "COMPLETADO") statePath.push("COMPLETADO");
        if (demo.estado === "RECHAZADO") statePath.push("EN_REVISION", "RECHAZADO");

        const history: Array<{
          accion: string;
          estadoAnterior: string | null;
          estadoNuevo: string | null;
          comentario: string | null;
          usuarioId: number;
          createdAt: Date;
        }> = statePath.map((state, stateIndex) => {
          const previousState = stateIndex === 0 ? null : statePath[stateIndex - 1];
          const isCreation = stateIndex === 0;
          return {
            accion: isCreation ? "CREACION" : "CAMBIO_ESTADO",
            estadoAnterior: previousState,
            estadoNuevo: state,
            comentario: isCreation
              ? "Solicitud registrada por la dependencia con los requerimientos adjuntos."
              : stateComments[state],
            usuarioId: isCreation ? solicitante.id : admin.id,
            createdAt: new Date(createdAt.getTime() + stateIndex * 3 * 60 * 60 * 1000),
          };
        });

        if (index === 0) {
          history.push({
            accion: "COMENTARIO",
            estadoAnterior: null,
            estadoNuevo: null,
            comentario: "¿Podrían confirmar el formato final antes de publicarlo?",
            usuarioId: solicitante.id,
            createdAt: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000),
          });
        }

        const request = await tx.solicitud.create({
          data: {
            codigo: code,
            titulo: demo.titulo,
            descripcion: demo.descripcion,
            seccionPortal: demo.seccionPortal,
            prioridad: demo.prioridad,
            estado: demo.estado,
            solicitanteId: solicitante.id,
            createdAt,
            fechaCompletado: demo.estado === "COMPLETADO"
              ? new Date(createdAt.getTime() + (statePath.length - 1) * 3 * 60 * 60 * 1000)
              : null,
            historiales: { create: history },
          },
          select: { id: true, codigo: true, titulo: true, estado: true, solicitanteId: true },
        });
        requests.push(request);
      }

      const attachmentRequest = requests[4];
      const attachment = await tx.archivo.create({
        data: {
          nombreOriginal: "Anexo de comunicado institucional.pdf",
          nombreGuardado: attachmentName,
          ruta: "",
          contenido: attachmentBuffer,
          tipoMime: "application/pdf",
          tamano: attachmentBuffer.length,
          solicitudId: attachmentRequest.id,
        },
      });
      await tx.archivo.update({
        where: { id: attachment.id },
        data: { ruta: `/api/archivos/${attachment.id}` },
      });

      const notifications = requests.map((request, index) => ({
        titulo: request.estado === "PENDIENTE" ? "Nueva solicitud" : (stateTitles[request.estado] ?? "Solicitud actualizada"),
        mensaje: `${request.codigo}: ${request.titulo}`,
        enlace: `/solicitudes/${request.id}`,
        leida: index % 2 === 0,
        tipo: request.estado === "PENDIENTE" ? "NUEVA_SOLICITUD" : "CAMBIO_ESTADO",
        usuarioId: request.solicitanteId,
        createdAt: new Date(Date.now() - index * 60 * 60 * 1000),
      }));
      await tx.notificacion.createMany({ data: notifications });

      const pendingRequests = requests.filter((request) => request.estado === "PENDIENTE");
      await tx.notificacion.createMany({
        data: pendingRequests.map((request) => ({
          titulo: `Nueva solicitud ${request.codigo}`,
          mensaje: `Solicitud pendiente de atención: "${request.titulo}"`,
          enlace: `/solicitudes/${request.id}`,
          leida: false,
          tipo: "NUEVA_SOLICITUD",
          usuarioId: admin.id,
        })),
      });

      return requests;
    }, { maxWait: 10000, timeout: 30000 });

  console.log("Datos de demostración insertados sin modificar registros existentes:");
  for (const request of created) {
    console.log(`${request.codigo}: ${request.estado} - ${request.titulo}`);
  }
  console.log(`Adjunto de prueba disponible en /api/archivos/${created[4].id}`);
}

main()
  .catch((error) => {
    console.error("No se pudieron cargar los datos de demostración:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
