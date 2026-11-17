-- Almacena el contenido del adjunto en la base de datos para que funcione en
-- entornos serverless (Vercel) donde el sistema de archivos es de solo lectura.
ALTER TABLE "Archivo" ADD COLUMN "contenido" BYTEA;
