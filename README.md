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
- **Base de Datos & ORM**: SQLite (fácil portabilidad a PostgreSQL) con Prisma ORM
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

### 3. Inicializar y poblar la Base de Datos
```bash
npx prisma db push
npx prisma db seed
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abra su navegador en [http://localhost:3000](http://localhost:3000).

---

## 🔑 Credenciales de Prueba

| Rol | Correo | Contraseña | Área / Departamento |
|---|---|---|---|
| **Admin TEIN** | `admin.tein@upt.pe` | `admin123` | Oficina de Tecnologías de la Información |
| **Solicitante FAING** | `ingenieria@upt.pe` | `user123` | Facultad de Ingeniería |
| **Solicitante Admisión** | `admision@upt.pe` | `user123` | Dirección de Admisión |
