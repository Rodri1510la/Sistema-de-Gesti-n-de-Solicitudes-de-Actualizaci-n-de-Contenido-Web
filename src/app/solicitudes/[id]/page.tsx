"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { EstadoBadge, PrioridadBadge } from "@/components/Badges";
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  ExternalLink,
  Download,
  FileText,
  FileCode,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  RefreshCw,
  Eye,
  X,
  Maximize2,
  Printer,
} from "lucide-react";

interface Archivo {
  id: number;
  nombreOriginal: string;
  nombreGuardado: string;
  ruta: string;
  tipoMime: string;
  tamano: number;
  createdAt: string;
}

interface HistorialItem {
  id: number;
  accion: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  comentario: string | null;
  createdAt: string;
  usuario: {
    id: number;
    nombre: string;
    rol: string;
    departamento: string;
  };
}

interface SolicitudDetalle {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  seccionPortal: string;
  prioridad: string;
  estado: string;
  fechaCompletado: string | null;
  createdAt: string;
  updatedAt: string;
  solicitante: {
    id: number;
    nombre: string;
    email: string;
    departamento: string;
    rol: string;
  };
  archivos: Archivo[];
  historiales: HistorialItem[];
}

function SolicitudDetailContent() {
  const router = useRouter();
  const params = useParams();
  const solicitudId = params?.id as string;

  const [usuario, setUsuario] = useState<any>(null);
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para formulario de cambio de estado (Admin TEIN)
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [comentarioAdmin, setComentarioAdmin] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Estados para nuevo comentario (Bidireccional)
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Estado para previsualización modal de archivos
  const [archivoPreview, setArchivoPreview] = useState<Archivo | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        setUsuario(userData.usuario);

        const solRes = await fetch(`/api/solicitudes/${solicitudId}`);
        if (!solRes.ok) {
          const errData = await solRes.json();
          throw new Error(errData.error || "No se pudo cargar la solicitud");
        }
        const solData = await solRes.json();
        setSolicitud(solData.solicitud);
        setNuevoEstado(solData.solicitud.estado);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [solicitudId, router]);

  // Actualizar estado (Admin TEIN)
  const handleCambiarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitud) return;

    setActualizando(true);
    setMensajeExito(null);
    setError(null);

    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nuevoEstado,
          comentario: comentarioAdmin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar estado");
      }

      setMensajeExito("Estado actualizado y registrado en la bitácora.");
      setComentarioAdmin("");

      // Recargar solicitud
      const solRes = await fetch(`/api/solicitudes/${solicitudId}`);
      const solData = await solRes.json();
      setSolicitud(solData.solicitud);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActualizando(false);
    }
  };

  // Enviar comentario / respuesta (Bidireccional: Solicitante y TEIN)
  const handleEnviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitud || !nuevoComentario.trim()) return;

    setEnviandoComentario(true);
    setError(null);

    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comentario: nuevoComentario.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al enviar comentario");
      }

      setNuevoComentario("");
      setMensajeExito("Mensaje enviado y notificado correctamente.");

      // Recargar solicitud para mostrar el nuevo comentario
      const solRes = await fetch(`/api/solicitudes/${solicitudId}`);
      const solData = await solRes.json();
      setSolicitud(solData.solicitud);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnviandoComentario(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Cargando detalles de la solicitud...</span>
        </div>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {usuario && <Navbar usuario={usuario} />}
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error al acceder</h2>
          <p className="text-sm text-slate-400 mb-6">{error || "Solicitud no encontrada"}</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white inline-block"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = usuario?.rol === "ADMIN";

  const isPreviewable = (nombre: string) => {
    const ext = nombre.split(".").pop()?.toLowerCase();
    return ext === "pdf" || ext === "png" || ext === "jpg" || ext === "jpeg";
  };

  const getFileIcon = (nombre: string) => {
    const ext = nombre.split(".").pop()?.toLowerCase();
    if (ext === "doc" || ext === "docx") {
      return <FileText className="w-5 h-5 text-blue-400" />;
    }
    if (ext === "pdf") {
      return <FileCode className="w-5 h-5 text-red-400" />;
    }
    if (ext === "png" || ext === "jpg" || ext === "jpeg") {
      return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar usuario={usuario} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera de navegación */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center space-x-3">
            {solicitud.estado === "COMPLETADO" && (
              <>
                <a
                  href={`/api/solicitudes/${solicitud.id}/acta`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
                  title="Descargar Acta de Conformidad en PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Acta de Conformidad (PDF)</span>
                </a>
                <Link
                  href={`/solicitudes/${solicitud.id}/acta`}
                  target="_blank"
                  className="inline-flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition-colors"
                  title="Abrir vista imprimible del acta"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Vista imprimible</span>
                </Link>
              </>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Código de Registro:</span>
              <span className="font-mono text-sm font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800/80">
                {solicitud.codigo}
              </span>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {mensajeExito && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-between text-emerald-200">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span className="text-sm font-medium">{mensajeExito}</span>
            </div>
            <button
              onClick={() => setMensajeExito(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Columna Izquierda: Información Principal y Archivos (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta de Título y Estado */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <EstadoBadge estado={solicitud.estado} />
                  <PrioridadBadge prioridad={solicitud.prioridad} />
                </div>
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Registrado el:{" "}
                    {new Date(solicitud.createdAt).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {solicitud.titulo}
              </h1>

              {/* Metadata en pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
                <div className="flex items-start space-x-2.5">
                  <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-medium">Departamento / Facultad:</span>
                    <span className="font-semibold text-slate-200">{solicitud.solicitante.departamento}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-medium">Solicitado por:</span>
                    <span className="font-semibold text-slate-200">
                      {solicitud.solicitante.nombre} ({solicitud.solicitante.email})
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-start space-x-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <ExternalLink className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Sección o URL del Portal Institucional a modificar:
                    </span>
                    <span className="font-semibold text-blue-300 break-all">
                      {solicitud.seccionPortal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalle o Descripción del requerimiento */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Detalle de las modificaciones requeridas:
                </h3>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {solicitud.descripcion}
                </div>
              </div>
            </div>

            {/* Archivos Adjuntos con Previsualización Modal */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1 flex items-center space-x-2">
                <span>Documentos y Archivos Adjuntos</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {solicitud.archivos.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Archivos Word, resoluciones o imágenes entregados como referencia para los cambios.
              </p>

              {solicitud.archivos.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  No se adjuntaron archivos para esta solicitud.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {solicitud.archivos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {getFileIcon(archivo.nombreOriginal)}
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate" title={archivo.nombreOriginal}>
                            {archivo.nombreOriginal}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(archivo.tamano / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {/* Botón Previsualizar para imágenes o PDFs */}
                        {isPreviewable(archivo.nombreOriginal) && (
                          <button
                            type="button"
                            onClick={() => setArchivoPreview(archivo)}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors"
                            title="Previsualizar archivo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Botón Descargar */}
                        <a
                          href={archivo.ruta}
                          download={archivo.nombreOriginal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors"
                          title="Descargar archivo"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de Gestión para Administradores de TEIN */}
            {isAdmin && (
              <div className="bg-slate-900/90 rounded-2xl border-2 border-blue-500/40 p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center space-x-2 text-blue-400 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">
                    Panel de Control TEIN — Gestión de Estado
                  </h3>
                </div>

                <form onSubmit={handleCambiarEstado} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Actualizar Estado del Requerimiento
                      </label>
                      <select
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_REVISION">En Revisión</option>
                        <option value="EN_PROCESO">En Proceso (Realizando cambios)</option>
                        <option value="COMPLETADO">Completado (Publicado en portal)</option>
                        <option value="RECHAZADO">Rechazado (No procede o datos incompletos)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Comentario o Justificación de la acción
                      </label>
                      <input
                        type="text"
                        value={comentarioAdmin}
                        onChange={(e) => setComentarioAdmin(e.target.value)}
                        required={nuevoEstado === "COMPLETADO" && solicitud.estado !== "COMPLETADO"}
                        placeholder="Describe los cambios publicados; obligatorio al completar."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={actualizando}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {actualizando ? (
                        <span>Guardando...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Guardar y Notificar en Bitácora</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Columna Derecha: Comunicación Bidireccional y Bitácora (1 col) */}
          <div className="space-y-6">
            {/* Caja de Enviar Respuesta / Consulta (Bidireccional) */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Responder / Agregar Observación</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                {isAdmin
                  ? "Escriba una indicación para el solicitante o equipo."
                  : "Consulte o envíe aclaraciones directamente a la oficina TEIN."}
              </p>

              <form onSubmit={handleEnviarComentario} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escriba un mensaje sobre este requerimiento..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={enviandoComentario || !nuevoComentario.trim()}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    {enviandoComentario ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Publicar Nota</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bitácora de Trazabilidad */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Bitácora de Trazabilidad</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Registro inmutable de acciones, cambios de estado y notas realizadas en este ticket.
              </p>

              {/* Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {solicitud.historiales.map((item, index) => (
                  <div key={item.id} className="relative group">
                    {/* Punto del timeline */}
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        index === 0
                          ? "bg-blue-500 ring-4 ring-blue-500/20"
                          : "bg-slate-700"
                      }`}
                    />

                    {/* Contenido del evento */}
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-white">
                          {item.usuario?.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleDateString("es-PE", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="mb-2">
                        {item.accion === "CREACION" && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            CREACIÓN DE SOLICITUD
                          </span>
                        )}
                        {item.accion === "CAMBIO_ESTADO" && (
                          <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-300">
                            <span>Estado:</span>
                            <span className="line-through text-slate-500">{item.estadoAnterior}</span>
                            <span>→</span>
                            <span className="text-blue-400 font-bold">{item.estadoNuevo}</span>
                          </div>
                        )}
                        {item.accion === "COMENTARIO" && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            MENSAJE / COMENTARIO
                          </span>
                        )}
                      </div>

                      {item.comentario && (
                        <p className="text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[11px] leading-relaxed flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
                          <span>&ldquo;{item.comentario}&rdquo;</span>
                        </p>
                      )}

                      <span className="text-[10px] text-slate-500 mt-1.5 block">
                        Área: {item.usuario?.departamento}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Previsualización Directa de Archivos */}
        {archivoPreview && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Encabezado del Modal */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 truncate">
                  {getFileIcon(archivoPreview.nombreOriginal)}
                  <span className="text-sm font-bold text-white truncate">
                    {archivoPreview.nombreOriginal}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({(archivoPreview.tamano / 1024).toFixed(1)} KB)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={archivoPreview.ruta}
                    download={archivoPreview.nombreOriginal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                  <button
                    onClick={() => setArchivoPreview(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido / Visor */}
              <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-950/50 min-h-[400px]">
                {archivoPreview.nombreOriginal.endsWith(".pdf") ? (
                  <iframe
                    src={archivoPreview.ruta}
                    className="w-full h-[70vh] rounded-xl border border-slate-800 bg-white"
                    title={archivoPreview.nombreOriginal}
                  />
                ) : (
                  <img
                    src={archivoPreview.ruta}
                    alt={archivoPreview.nombreOriginal}
                    className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-lg"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SolicitudDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <span>Cargando...</span>
        </div>
      }
    >
      <SolicitudDetailContent />
    </Suspense>
  );
}
