# Sistema de Gestión de Solicitudes de Actualización de Contenido Web (SGSACW)

> **Proyecto de Prácticas Pre-Profesionales**  
> **Institución**: Universidad Privada de Tacna — Oficina TEIN (Tecnologías de la Información)  
> **Practicante**: Rodrigo Soto

---

## 📌 Descripción del Proyecto

El **SGSACW** es una plataforma web desarrollada para la Oficina de Tecnologías de la Información (TEIN) de la Universidad Privada de Tacna. Centraliza, estandariza y hace seguimiento a las solicitudes de modificación y actualización de contenidos en los portales web institucionales emitidas por facultades, decanatos y dependencias académicas o administrativas.

---

## 🛠️ Stack Tecnológico

- **Frontend & Backend**: Next.js 16 (App Router, Server & Client Components) + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4 + Lucide Icons
- **Base de Datos & ORM**: PostgreSQL en Supabase con Prisma ORM
- **Seguridad & Autenticación**: JWT seguro (cookies HTTP-only) con hashing de contraseñas mediante `bcryptjs`

---

## 🌟 Módulos y Funcionalidades

1. **Autenticación con Roles**:
   - `ADMIN (TEIN)`: Acceso al panel maestro, gestión de estados, directorio de dependencias y bitácora.
   - `SOLICITANTE`: Creación de tickets, seguimiento de estado y descarga de adjuntos.
   - Botones de acceso rápido para pruebas y demostraciones.
2. **Gestión de Solicitudes**:
   - Asignación de código único correlativo (`SOL-YYYY-XXX`).
   - Priorización: Urgente, Alta, Media, Baja.
   - Registro de sección o URL institucional a modificar.
3. **Carga y Descarga de Archivos Adjuntos**:
   - Admite documentos Word (`.docx`, `.doc`), resoluciones en PDF e imágenes (`.png`, `.jpg`).
4. **Flujo de Estados y Trazabilidad**:
   - Ciclo: *Pendiente ➔ En Revisión ➔ En Proceso ➔ Completado / Rechazado*.
   - Historial inmutable con fecha, hora, responsable y comentarios de cada acción.
5. **Búsqueda y Filtros**:
   - Búsqueda en tiempo real por texto (código, título, facultad, sección) y filtros por estado y prioridad.
6. **Directorio de Áreas y Usuarios**:
   - Control de facultades registradas y volumen de solicitudes remitidas.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/Rodri1510la/Sistema-de-Gesti-n-de-Solicitudes-de-Actualizaci-n-de-Contenido-Web.git
cd Sistema-de-Gesti-n-de-Solicitudes-de-Actualizaci-n-de-Contenido-Web
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en Supabase y copia `.env.example` como `.env`.
2. En el SQL Editor de Supabase, crea el rol de ejecución limitado antes de aplicar migraciones:
   ```sql
   create role sgsacw_app login password 'REEMPLAZAR_POR_UNA_CLAVE_FUERTE';
   grant usage on schema public to sgsacw_app;
   grant select, insert, update, delete on all tables in schema public to sgsacw_app;
   grant usage, select on all sequences in schema public to sgsacw_app;
   alter default privileges for role postgres in schema public
     grant select, insert, update, delete on tables to sgsacw_app;
   alter default privileges for role postgres in schema public
     grant usage, select on sequences to sgsacw_app;
   ```
3. En **Connect** de Supabase, configura:
   - `DATABASE_URL`: URL del *Transaction Pooler* (puerto `6543`) con usuario `sgsacw_app.<PROJECT_REF>` para Vercel; conserva `pgbouncer=true`.
   - `DIRECT_URL`: URL del *Session Pooler* (puerto `5432`) con usuario de migraciones `postgres.<PROJECT_REF>`.
4. Genera un valor secreto aleatorio para `JWT_SECRET`. No uses el prefijo `NEXT_PUBLIC_` para ninguna de estas variables.

Las contraseñas con caracteres especiales deben estar codificadas para URL. No compartas ni subas el archivo `.env`.

### 4. Crear el esquema e importar los datos locales

Aplica las migraciones a la base Supabase vacía:
```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

Para conservar los registros de `prisma/dev.db`, exporta e importa los datos después de crear las tablas:
```bash
npm run prisma:sqlite:export
npm run prisma:sqlite:import
```

La importación se cancela si la base de destino ya contiene datos; no borra tablas ni registros. El archivo de exportación temporal se elimina al completar la importación. El comando `prisma:seed` es destructivo y está bloqueado salvo que se habilite explícitamente para una base local de desarrollo.

Configura `DATABASE_URL`, `DIRECT_URL` y `JWT_SECRET` en las variables de entorno del proyecto en Vercel. Ejecuta las migraciones antes de desplegar la aplicación.
Las URLs se usan solo en el servidor; nunca las expongas con el prefijo `NEXT_PUBLIC_`. La aplicación aplica autorización en sus API con su propio JWT; ese JWT no configura automáticamente las políticas RLS de Supabase. Si solo se accederá a la base mediante Prisma, desactiva la Data API de Supabase o configura explícitamente sus permisos.

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abra su navegador en [http://localhost:3000](http://localhost:3000).

---

## 🔑 Credenciales de Prueba

Estas credenciales son únicamente para la base demo local. La migración conserva sus hashes; cambia las contraseñas de estas cuentas antes de importar los datos a un entorno público de producción.

| Rol | Correo | Contraseña | Área / Departamento |
|---|---|---|---|
| **Admin TEIN** | `admin.tein@upt.pe` | `admin123` | Oficina de Tecnologías de la Información |
| **Solicitante FAING** | `ingenieria@upt.pe` | `user123` | Facultad de Ingeniería |
| **Solicitante Admisión** | `admision@upt.pe` | `user123` | Dirección de Admisión |
