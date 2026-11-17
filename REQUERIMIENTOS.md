# 📋 Sistema de Gestión de Solicitudes de Actualización de Contenido Web (SGSACW)

> **Proyecto de Prácticas Pre-Profesionales**  
> **Institución**: Universidad Privada de Tacna — Oficina TEIN (Tecnologías de la Información)  
> **Practicante**: Rodrigo Soto  

---

## 1. Descripción del Problema

La Oficina de Tecnologías de la Información (TEIN) de la Universidad Privada de Tacna recibe documentos Word de diversos departamentos y carreras de la universidad, solicitando cambios o actualizaciones en sus respectivas secciones del portal web institucional. Este proceso se realiza de forma manual y desorganizada, lo que genera:

- **Pérdida de trazabilidad**: No hay registro formal de qué se solicitó, cuándo ni por quién.
- **Dificultad de seguimiento**: Los departamentos no saben en qué estado se encuentra su solicitud.
- **Desorganización**: Documentos recibidos por múltiples canales (correo, USB, físico) sin un punto centralizado.
- **Falta de historial**: No hay bitácora de cambios realizados en el portal.

## 2. Solución Propuesta

Desarrollar un **Sistema Web de Gestión de Solicitudes** que digitalice y centralice el proceso de recepción, seguimiento y ejecución de solicitudes de actualización de contenido web del portal universitario.

## 3. Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Frontend** | React + Next.js (App Router) |
| **Backend** | Next.js API Routes (Node.js) |
| **Base de Datos** | PostgreSQL en Supabase (Prisma); SQLite como origen de los datos locales |
| **ORM** | Prisma |
| **Autenticación** | NextAuth.js / JWT con bcrypt |
| **Estilos** | Tailwind CSS |
| **Almacenamiento de archivos** | Sistema de archivos local (uploads/) |

## 4. Módulos del Sistema

### 4.1 Autenticación y Roles

| Rol | Permisos |
|-----|----------|
| **Administrador (TEIN)** | Ver todas las solicitudes, cambiar estados, asignar, ver historial completo, gestionar usuarios |
| **Solicitante (Departamento)** | Crear solicitudes, subir archivos, ver sus propias solicitudes y su estado |

- Registro de usuarios y login con email y contraseña
- Sesiones seguras con JWT / cookies
- Control de acceso por rol

### 4.2 Gestión de Solicitudes

Cada solicitud contiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | Texto | Título descriptivo del cambio solicitado |
| `descripcion` | Texto largo | Detalle de los cambios requeridos |
| `seccion_portal` | Texto | Sección del portal web a modificar |
| `prioridad` | Enum | Baja, Media, Alta, Urgente |
| `departamento` | Texto / Catálogo institucional | Uno de los 35 departamentos oficiales disponibles al registrarse |
| `archivos` | Archivos | Documentos Word, imágenes, PDF adjuntos |
| `estado` | Enum | Estado actual de la solicitud |
| `fecha_creacion` | Timestamp | Fecha de creación automática |
| `fecha_actualizacion` | Timestamp | Última modificación |

### 4.3 Flujo de Estados

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Solicitud creada
    Pendiente --> EnRevision: Admin toma la solicitud
    EnRevision --> EnProceso: Admin aprueba y comienza trabajo
    EnRevision --> Rechazado: Admin rechaza (con motivo)
    EnProceso --> Completado: Cambios realizados
    Rechazado --> [*]
    Completado --> [*]
```

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Solicitud recién creada, sin atender |
| **En Revisión** | El admin está revisando la solicitud |
| **En Proceso** | Los cambios están siendo implementados |
| **Completado** | Cambios realizados exitosamente |
| **Rechazado** | Solicitud rechazada (se registra el motivo) |

### 4.4 Archivos Adjuntos

- Formatos permitidos: `.docx`, `.doc`, `.pdf`, `.png`, `.jpg`, `.jpeg`
- Tamaño máximo por archivo: 10 MB
- Múltiples archivos por solicitud
- Descarga y visualización directa desde el sistema

### 4.5 Historial / Bitácora

Cada acción queda registrada automáticamente:

- Creación de solicitud
- Cambios de estado (con fecha, usuario y comentario)
- Archivos subidos
- Modificaciones a la solicitud

### 4.6 Búsqueda y Filtrado

- Filtrar por: estado, departamento, prioridad, rango de fechas
- Búsqueda por texto en título y descripción
- Ordenar por: fecha, prioridad, estado

### 4.7 Sistema de Notificaciones en Tiempo Real (In-App)

- Campanita interactiva en el Navbar con contador visual de alertas no leídas (`unreadCount`).
- Notificaciones automáticas por eventos:
  - Al Solicitante: Alertas cuando TEIN actualiza el estado (ej. *Pendiente ➔ En Proceso*) o agrega una observación.
  - Al Administrador (TEIN): Alertas cuando cualquier departamento remite una nueva solicitud o responde a una consulta.
- Menú desplegable con listado de eventos, botón "Marcar leídas" y redirección con un clic al requerimiento en cuestión.

### 4.8 Comunicación Bidireccional en el Ticket

- Canal directo de diálogo entre el Solicitante (departamento) y la Oficina TEIN dentro de la misma solicitud.
- Permite subsanar observaciones, solicitar aclaraciones o confirmar detalles sin necesidad de abrir tickets duplicados.
- Registro inmutable en la bitácora de trazabilidad con autor, área y marca temporal.

### 4.9 Previsualización Modal Directa de Archivos

- Visor modal integrado directamente en la interfaz para archivos compatibles:
  - Documentos `.pdf` embebidos en alta definición.
  - Imágenes `.png`, `.jpg`, `.jpeg` con visualización en escala completa.
- Permite a los técnicos de TEIN inspeccionar el contenido sin verse obligados a descargar los archivos al disco local.

### 4.10 Generación de Acta de Conformidad y Ficha Técnica en PDF (RF11)

- Descarga directa de acta PDF membretada en formato A4 para solicitudes completadas.
- Incluye código único, fechas de solicitud y publicación, dependencia solicitante, cambios publicados y sección web intervenida.
- Incluye recuadros para firma y sello de la Jefatura de TEIN y del Decano/Director solicitante.
- El detalle de los cambios publicados es obligatorio al completar una solicitud.
- La generación requiere autenticación y solo permite acceso al personal TEIN o al solicitante dueño del ticket.

## 5. Estructura de Páginas

```
/ (Landing / Login)
├── /login
├── /register
├── /dashboard
│   ├── Vista Solicitante: Mis solicitudes + Crear nueva
│   └── Vista Admin: Todas las solicitudes + Filtros
├── /solicitudes
│   ├── /nueva          → Formulario de nueva solicitud
│   └── /[id]           → Detalle de solicitud + historial + archivos
└── /usuarios           → (Solo Admin) Gestión de usuarios
```

## 6. Modelo de Base de Datos (Entidades)

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nombre
        string email UK
        string password
        string rol
        string departamento
        boolean activo
        datetime createdAt
    }
    SOLICITUD {
        int id PK
        string titulo
        text descripcion
        string seccion_portal
        string prioridad
        string estado
        int solicitante_id FK
        datetime createdAt
        datetime updatedAt
    }
    ARCHIVO {
        int id PK
        string nombre_original
        string ruta
        string tipo_mime
        int tamano
        int solicitud_id FK
        datetime createdAt
    }
    HISTORIAL {
        int id PK
        int solicitud_id FK
        int usuario_id FK
        string accion
        string estado_anterior
        string estado_nuevo
        text comentario
        datetime createdAt
    }
    NOTIFICACION {
        int id PK
        int usuario_id FK
        string titulo
        string mensaje
        string enlace
        string tipo
        boolean leida
        datetime createdAt
    }

    USUARIO ||--o{ SOLICITUD : "crea"
    SOLICITUD ||--o{ ARCHIVO : "tiene"
    SOLICITUD ||--o{ HISTORIAL : "registra"
    USUARIO ||--o{ HISTORIAL : "ejecuta"
    USUARIO ||--o{ NOTIFICACION : "recibe"
```

## 7. Requerimientos No Funcionales

- **Responsivo**: Adaptable a móvil, tablet y escritorio
- **Seguridad**: Contraseñas hasheadas (bcrypt), sesiones con tokens seguros, validación de archivos
- **Rendimiento**: Paginación en listados, carga eficiente de archivos
- **Usabilidad**: Interfaz moderna e intuitiva con Tailwind CSS

## 8. Progreso del Desarrollo

- [x] Estructura base del proyecto creada (`sgsacw` con Next.js)
- [x] Configuración de Prisma para PostgreSQL/Supabase y migración inicial
- [ ] Aplicación de migraciones y traslado de datos a Supabase (pendiente configurar credenciales remotas)
- [x] Autenticación (registro, login, roles ADMIN y SOLICITANTE, JWT)
- [x] CRUD de solicitudes con códigos correlativos (SOL-YYYY-XXX)
- [x] Subida y descarga de archivos adjuntos (Word, PDF, Imágenes)
- [x] Flujo de estados con bitácora e historial inmutable
- [x] Búsqueda y filtrado dinámico (estado, prioridad, departamento, texto)
- [x] Interfaz UI completa y responsiva (Tailwind CSS, Dashboard, Formularios, Detalle)
- [x] Sistema de Notificaciones en Tiempo Real (Campanita con contador y alertas automáticas)
- [x] Comunicación Bidireccional en el Ticket (Comentarios y respuestas entre TEIN y Solicitante)
- [x] Previsualización Modal Directa de Archivos (Visor integrado para imágenes y documentos PDF)
- [x] Verificación y compilación de producción exitosa (`next build` 0 errores)
