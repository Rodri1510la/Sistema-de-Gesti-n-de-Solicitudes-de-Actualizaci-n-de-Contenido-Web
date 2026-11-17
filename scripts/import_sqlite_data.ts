import { loadEnvConfig } from "@next/env";
import { execSync } from "node:child_process";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFile } from "node:fs/promises";

loadEnvConfig(process.cwd());

const exportPath = path.join(tmpdir(), "sgsacw-sqlite-export.json");
const connectionString = process.env.DIRECT_URL;

type SQLiteExport = {
  Usuario: Array<{
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: string;
    departamento: string;
    activo: number | boolean;
    createdAt: string | number;
    updatedAt: string | number;
  }>;
  Solicitud: Array<{
    id: number;
    codigo: string;
    titulo: string;
    descripcion: string;
    seccionPortal: string;
    prioridad: string;
    estado: string;
    solicitanteId: number;
    fechaCompletado: string | number | null;
    createdAt: string | number;
    updatedAt: string | number;
  }>;
  Archivo: Array<{
    id: number;
    nombreOriginal: string;
    nombreGuardado: string;
    ruta: string;
    tipoMime: string;
    tamano: number;
    solicitudId: number;
    createdAt: string | number;
  }>;
  Historial: Array<{
    id: number;
    accion: string;
    estadoAnterior: string | null;
    estadoNuevo: string | null;
    comentario: string | null;
    solicitudId: number;
    usuarioId: number;
    createdAt: string | number;
  }>;
  Notificacion: Array<{
    id: number;
    titulo: string;
    mensaje: string;
    enlace: string;
    leida: number | boolean;
    tipo: string;
    usuarioId: number;
    createdAt: string | number;
  }>;
};

function toDate(value: string | number) {
  if (typeof value === "number") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Fecha no válida en la exportación SQLite: ${value}`);
    }
    return date;
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const normalized = hasTimezone ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Fecha no válida en la exportación SQLite: ${value}`);
  }
  return date;
}

function toSqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("La exportación contiene un número no válido");
    return String(value);
  }

  const text = value instanceof Date ? value.toISOString() : String(value);
  return `'${text.replace(/'/g, "''")}'`;
}

function insertStatements(table: string, rows: Array<Record<string, unknown>>) {
  return rows.map((row) => {
    const columns = Object.keys(row);
    const columnNames = columns.map((column) => `"${column}"`).join(", ");
    const values = columns.map((column) => toSqlValue(row[column])).join(", ");
    return `INSERT INTO "${table}" (${columnNames}) VALUES (${values});`;
  });
}

async function main() {
  if (!connectionString) {
    throw new Error("DIRECT_URL es obligatorio para importar datos con permisos de migración.");
  }

  const json = await readFile(exportPath, "utf8");
  const data = JSON.parse(json) as SQLiteExport;
  const tableNames = ["Usuario", "Solicitud", "Archivo", "Historial", "Notificacion"] as const;
  if (tableNames.some((table) => !Array.isArray(data[table]))) {
    throw new Error("El archivo de exportación SQLite no tiene el formato esperado");
  }

  const usuarios = data.Usuario.map((row) => ({
    ...row,
    activo: Boolean(row.activo),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }));
  const solicitudes = data.Solicitud.map((row) => ({
    ...row,
    fechaCompletado: row.fechaCompletado ? toDate(row.fechaCompletado) : null,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }));
  const archivos = data.Archivo.map((row) => ({
    ...row,
    createdAt: toDate(row.createdAt),
  }));
  const historiales = data.Historial.map((row) => ({
    ...row,
    createdAt: toDate(row.createdAt),
  }));
  const notificaciones = data.Notificacion.map((row) => ({
    ...row,
    leida: Boolean(row.leida),
    createdAt: toDate(row.createdAt),
  }));

  const tableRows: Array<[string, Array<Record<string, unknown>>]> = [
    ["Usuario", usuarios],
    ["Solicitud", solicitudes],
    ["Archivo", archivos],
    ["Historial", historiales],
    ["Notificacion", notificaciones],
  ];
  const emptyTableGuard = tableRows
    .map(([table]) => `EXISTS (SELECT 1 FROM "${table}")`)
    .join(" OR ");
  const statements = tableRows.flatMap(([table, rows]) => insertStatements(table, rows));
  const sequenceStatements = tableRows.map(
    ([table]) => `
      SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE(MAX("id"), 1),
        COUNT(*) > 0
      )
      FROM "${table}";
    `
  );
  const sql = `
    BEGIN;
    DO $$
    BEGIN
      IF ${emptyTableGuard} THEN
        RAISE EXCEPTION 'Supabase is not empty; import cancelled to prevent duplicates.';
      END IF;
    END
    $$;
    ${statements.join("\n")}
    ${sequenceStatements.join("\n")}
    COMMIT;
  `;

  execSync("npx prisma db execute --stdin --schema prisma/schema.prisma", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: connectionString },
    input: sql,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  try {
    await unlink(exportPath);
  } catch (error) {
    console.warn("Los datos se importaron, pero no se pudo borrar el archivo temporal:", error);
  }

  console.log(
    `Importación completada. Usuarios: ${data.Usuario.length}, solicitudes: ${data.Solicitud.length}, ` +
      `archivos: ${data.Archivo.length}, historiales: ${data.Historial.length}, ` +
      `notificaciones: ${data.Notificacion.length}.`
  );
}

main()
  .catch((error) => {
    console.error("No se pudo importar la base SQLite:", error);
    process.exitCode = 1;
  });
