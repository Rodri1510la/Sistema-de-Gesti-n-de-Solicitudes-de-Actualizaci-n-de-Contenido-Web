import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.historial.deleteMany();
  await prisma.archivo.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("Creando usuarios...");
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const hashedPasswordUser = await bcrypt.hash("user123", 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador TEIN",
      email: "admin.tein@upt.pe",
      password: hashedPasswordAdmin,
      rol: "ADMIN",
      departamento: "Oficina de Tecnologías de la Información (TEIN)",
      activo: true,
    },
  });

  const userFaing = await prisma.usuario.create({
    data: {
      nombre: "Ing. Carlos Mendoza",
      email: "ingenieria@upt.pe",
      password: hashedPasswordUser,
      rol: "SOLICITANTE",
      departamento: "Facultad de Ingeniería",
      activo: true,
    },
  });

  const userAdmision = await prisma.usuario.create({
    data: {
      nombre: "Lic. María Flores",
      email: "admision@upt.pe",
      password: hashedPasswordUser,
      rol: "SOLICITANTE",
      departamento: "Dirección de Admisión",
      activo: true,
    },
  });

  console.log("Creando solicitudes de ejemplo...");

  const sol1 = await prisma.solicitud.create({
    data: {
      codigo: "SOL-2026-001",
      titulo: "Actualización de Plan de Estudios 2026 - Ing. de Sistemas",
      descripcion:
        "Se solicita reemplazar la malla curricular del X ciclo y actualizar la sumilla de los cursos de Inteligencia Artificial y Cloud Computing según el documento Word adjunto.",
      seccionPortal: "Portal FAING > Escuela de Ingeniería de Sistemas > Plan Curricular",
      prioridad: "ALTA",
      estado: "EN_PROCESO",
      solicitanteId: userFaing.id,
      historiales: {
        create: [
          {
            accion: "CREACION",
            estadoNuevo: "PENDIENTE",
            comentario: "Solicitud registrada por el departamento con requerimientos adjuntos.",
            usuarioId: userFaing.id,
          },
          {
            accion: "CAMBIO_ESTADO",
            estadoAnterior: "PENDIENTE",
            estadoNuevo: "EN_REVISION",
            comentario: "Revisando documento word con la nueva malla curricular.",
            usuarioId: admin.id,
          },
          {
            accion: "CAMBIO_ESTADO",
            estadoAnterior: "EN_REVISION",
            estadoNuevo: "EN_PROCESO",
            comentario: "Se inició la maquetación y carga en el CMS institucional.",
            usuarioId: admin.id,
          },
        ],
      },
    },
  });

  const sol2 = await prisma.solicitud.create({
    data: {
      codigo: "SOL-2026-002",
      titulo: "Publicación de Convocatoria Examen de Admisión 2026-II",
      descripcion:
        "Publicar las fechas oficiales del cronograma de admisión, costos por modalidad y enlace al formulario de pre-inscripción.",
      seccionPortal: "Portal Principal > Admisión 2026-II > Cronograma y Requisitos",
      prioridad: "URGENTE",
      estado: "PENDIENTE",
      solicitanteId: userAdmision.id,
      historiales: {
        create: [
          {
            accion: "CREACION",
            estadoNuevo: "PENDIENTE",
            comentario: "Solicitud urgente registrada previo al lanzamiento de campaña publicitaria.",
            usuarioId: userAdmision.id,
          },
        ],
      },
    },
  });

  const sol3 = await prisma.solicitud.create({
    data: {
      codigo: "SOL-2026-003",
      titulo: "Actualización de Horarios de Laboratorios de Cómputo",
      descripcion:
        "Cambio en los horarios de atención y asignación de aulas de los laboratorios L1, L2 y L3 de la facultad para el presente semestre.",
      seccionPortal: "Portal FAING > Infraestructura > Laboratorios",
      prioridad: "MEDIA",
      estado: "COMPLETADO",
      solicitanteId: userFaing.id,
      fechaCompletado: new Date(),
      historiales: {
        create: [
          {
            accion: "CREACION",
            estadoNuevo: "PENDIENTE",
            comentario: "Solicitud creada con nuevo horario aprobado por Consejo de Facultad.",
            usuarioId: userFaing.id,
          },
          {
            accion: "CAMBIO_ESTADO",
            estadoAnterior: "PENDIENTE",
            estadoNuevo: "EN_PROCESO",
            comentario: "Procediendo a actualizar las tablas html del portal.",
            usuarioId: admin.id,
          },
          {
            accion: "CAMBIO_ESTADO",
            estadoAnterior: "EN_PROCESO",
            estadoNuevo: "COMPLETADO",
            comentario: "Horarios actualizados y validados en el portal oficial.",
            usuarioId: admin.id,
          },
        ],
      },
    },
  });

  console.log("Base de datos inicializada con éxito.");
  console.log("Usuarios de prueba:");
  console.log("Admin: admin.tein@upt.pe / admin123");
  console.log("Solicitante FAING: ingenieria@upt.pe / user123");
  console.log("Solicitante Admisión: admision@upt.pe / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
