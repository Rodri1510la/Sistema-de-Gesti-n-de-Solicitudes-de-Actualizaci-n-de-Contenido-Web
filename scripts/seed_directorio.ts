import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEPARTAMENTOS } from "../src/lib/departamentos";

loadEnvConfig(process.cwd());

const connectionUrl = process.env.DIRECT_URL;
if (!connectionUrl) {
  throw new Error("DIRECT_URL es obligatorio para cargar el directorio de usuarios.");
}

const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } },
});

// Contraseña inicial de todas las cuentas del directorio (cámbiala en producción).
const PASSWORD_INICIAL = process.env.DIRECTORIO_PASSWORD ?? "upt2026";

type Registro = {
  nombre: string;
  email: string;
  departamento: (typeof DEPARTAMENTOS)[number];
};

/**
 * Directorio institucional UPT.
 * Los nombres marcados como "referencial" no figuran en el directorio público
 * y se usaron como dato de demostración.
 */
const DIRECTORIO: Registro[] = [
  // Autoridades y órganos de gobierno
  {
    nombre: "Lic. Roxana Isabel Chura Pilco",
    email: "mesadepartes@upt.edu.pe",
    departamento: "Mesa de Partes Virtual / Central", // nombre referencial
  },
  {
    nombre: "Dr. Hugo Cirilo Calizaya Calizaya",
    email: "rectorado@upt.edu.pe",
    departamento: "Rectorado",
  },
  {
    nombre: "Dra. Mariella Rosario Ibarra Montecinos",
    email: "sgeneral@upt.edu.pe",
    departamento: "Secretaría General",
  },
  {
    nombre: "Dr. Arcadio Atencio Vargas",
    email: "vicerrectoradoacademico@upt.edu.pe",
    departamento: "Vicerrectorado Académico",
  },
  {
    nombre: "Dr. Elmer Marcial Limache Sandoval",
    email: "vicerrectoradoinvestigacion@upt.edu.pe",
    departamento: "Vicerrectorado de Investigación",
  },

  // Oficinas de la Alta Dirección y staff
  {
    nombre: "MSc. Gisella Delgado Barreda",
    email: "oci@upt.edu.pe",
    departamento: "Oficina de Control Interno",
  },
  {
    nombre: "Mgr. Mauricio Julio MacLean Cuadros",
    email: "ajuridica@upt.edu.pe",
    departamento: "Oficina de Asesoría Jurídica y Legal",
  },
  {
    nombre: "Mag. Julio Francisco Gárate Delgado",
    email: "planificacion@upt.edu.pe",
    departamento: "Oficina de Planeamiento y Desarrollo",
  },
  {
    nombre: "Lic. Carla Patricia Rodríguez Vargas",
    email: "rpublicas@upt.edu.pe",
    departamento: "Oficina de Imagen Institucional", // nombre referencial
  },
  {
    nombre: "Omar Pezo Jiménez",
    email: "cooperacion@upt.edu.pe",
    departamento: "Oficina de Relaciones Nacionales e Internacionales",
  },
  {
    nombre: "Dra. Martha Judith Paredes Vignola",
    email: "intranet@upt.edu.pe",
    departamento: "Oficina de Tecnologías de Información (TEIN)",
  },
  {
    nombre: "Dra. Juana Carlota Macarena Herrera Solís",
    email: "autoevaluacion@upt.edu.pe",
    departamento: "Oficina de Gestión de la Calidad",
  },
  {
    nombre: "Dr. Fernando Sebastián Heredia Gonzales",
    email: "defensoria@upt.edu.pe",
    departamento: "Oficina de Defensoría Universitaria",
  },
  {
    nombre: "Dra. Eloyna Lucía Peñaloza Arana",
    email: "administracion@upt.edu.pe",
    departamento: "Dirección General de Administración (DGA)",
  },

  // Áreas administrativas de la DGA
  {
    nombre: "C.P.C. Rosa Elena Cahuana Mamani",
    email: "contabilidad@upt.edu.pe",
    departamento: "Área de Contabilidad", // nombre referencial
  },
  {
    nombre: "C.P.C. Jorge Luis Arias Ticona",
    email: "tesoreria@upt.edu.pe",
    departamento: "Área de Tesorería", // nombre referencial
  },
  {
    nombre: "Lic. Sandra Milagros Vílchez Quispe",
    email: "potencialhumano@upt.edu.pe",
    departamento: "Área de Gestión del Potencial Humano", // nombre referencial
  },
  {
    nombre: "Ing. Percy Ronald Choque Apaza",
    email: "abastecimiento@upt.edu.pe",
    departamento: "Área de Abastecimiento y Logística", // nombre referencial
  },

  // Vicerrectorado Académico y oficinas de apoyo
  {
    nombre: "Dra. Lys Solagne Salinas Morales",
    email: "gpad@upt.pe",
    departamento: "Oficina de Gestión de Procesos Académicos y Docencia (GPAD)",
  },
  {
    nombre: "Mag. Gina Gotuzzo Ovalle",
    email: "obun@upt.edu.pe",
    departamento: "Oficina de Bienestar Universitario",
  },
  {
    nombre: "Dr. Sam Espinoza Vidaurre",
    email: "proyeccion@upt.edu.pe",
    departamento: "Oficina de Responsabilidad Social Universitaria (RESU)",
  },
  {
    nombre: "Mg. Víctor Hugo Mamani Coayla",
    email: "admision@upt.edu.pe",
    departamento: "Oficina de Admisión y Marketing", // nombre referencial
  },
  {
    nombre: "Ing. Diego Alonso Flores Chambilla",
    email: "soporteuptvirtual@upt.pe",
    departamento: "Oficina de Educación Virtual", // nombre referencial
  },

  // Vicerrectorado de Investigación
  {
    nombre: "Luis Alfredo Fernández Vizcarra",
    email: "investigacion@upt.edu.pe",
    departamento: "Oficina de Procesos de Investigación y Transferencia Tecnológica",
  },
  {
    nombre: "Dr. Guido Benedicto Palumbo Pinto",
    email: "biblioteca@upt.edu.pe",
    departamento: "Oficina de Biblioteca y Servicios Académicos",
  },

  // Decanatos y secretarías académico-administrativas
  {
    nombre: "Dr. Noribal Jorge Zegarra Alvarado",
    email: "decanofaing@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FAING",
  },
  {
    nombre: "Mtro. Rolando Salazar Calderón Juárez",
    email: "sec.academicofaing@upt.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FAING",
  },
  {
    nombre: "Dr. Ascención Américo Flores Flores",
    email: "facem@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FACEM",
  },
  {
    nombre: "Dr. Rafael Fortunato Supo Hallasi",
    email: "fade@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FADE",
  },
  {
    nombre: "Mag. Elvira del Carmen Reynoso Carpio",
    // Correo derivado del patrón de FAING; el directorio no publica uno propio.
    email: "sec.academicofade@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FADE",
  },
  {
    nombre: "Dr. Marco Carlos Alejandro Rivarola Hidalgo",
    email: "facsa@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FACSA",
  },
  {
    nombre: "Dra. Patricia Rosa María Nué Caballero",
    email: "faedcoh@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FAEDCOH",
  },
  {
    nombre: "Dra. Nelly Luzgarda Gonzales Muñiz",
    email: "arquitectura@upt.edu.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FAU",
  },
  {
    nombre: "Mtra. Janeth Noemi Cruz Chiri",
    email: "sec.academica@upt.pe",
    departamento: "Decanato y Secretaría Académico-Administrativa de FAU",
  },

  // Escuelas y unidades académicas
  {
    nombre: "Mtra. Haydee Raquel Sisa Yataco",
    email: "sistemas@upt.edu.pe",
    departamento: "Direcciones de Escuelas Profesionales",
  },
  {
    nombre: "Dr. Pedro Ronald Cárdenas Rueda",
    email: "posgrado@upt.edu.pe",
    departamento: "Escuela de Posgrado (ESPG)",
  },
  {
    nombre: "Lic. Cristina Middlebrook",
    email: "ceid@upt.edu.pe",
    departamento: "Centro de Idiomas (CEID)",
  },
  {
    nombre: "Lic. Marco Antonio Vargas Condori",
    email: "cepu@upt.edu.pe",
    departamento: "Centro Preuniversitario (CEPU)", // nombre referencial
  },
];

async function main() {
  const emails = new Set<string>();
  for (const registro of DIRECTORIO) {
    if (emails.has(registro.email)) {
      throw new Error(`Correo duplicado en el directorio: ${registro.email}`);
    }
    emails.add(registro.email);

    if (!DEPARTAMENTOS.includes(registro.departamento)) {
      throw new Error(
        `Departamento no válido en el directorio: ${registro.departamento}`
      );
    }
  }

  const passwordHash = await bcrypt.hash(PASSWORD_INICIAL, 10);
  let creados = 0;
  let actualizados = 0;

  for (const registro of DIRECTORIO) {
    const existente = await prisma.usuario.findUnique({
      where: { email: registro.email },
      select: { id: true },
    });

    if (existente) {
      await prisma.usuario.update({
        where: { id: existente.id },
        data: {
          nombre: registro.nombre,
          departamento: registro.departamento,
          activo: true,
        },
      });
      actualizados += 1;
    } else {
      await prisma.usuario.create({
        data: {
          nombre: registro.nombre,
          email: registro.email,
          password: passwordHash,
          rol: "SOLICITANTE",
          departamento: registro.departamento,
          activo: true,
        },
      });
      creados += 1;
    }
  }

  const total = await prisma.usuario.count();

  console.log(`Directorio procesado: ${creados} creados, ${actualizados} actualizados.`);
  console.log(`Total de usuarios en la base: ${total}`);
  console.log(`Contraseña inicial de las cuentas nuevas: ${PASSWORD_INICIAL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
