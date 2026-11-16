"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
  FileCheck,
} from "lucide-react";

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [seccionPortal, setSeccionPortal] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUsuario(data.usuario);
      } catch (err) {
        router.push("/login");
      }
    }
    loadUser();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Validar tamaño máximo 10MB por archivo
      const archivosValidos = newFiles.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} supera el límite de 10 MB.`);
          return false;
        }
        return true;
      });

      setArchivos((prev) => [...prev, ...archivosValidos]);
    }
  };

  const removeFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("seccionPortal", seccionPortal);
      formData.append("prioridad", prioridad);
      formData.append("descripcion", descripcion);

      archivos.forEach((file) => {
        formData.append("archivos", file);
      });

      const res = await fetch("/api/solicitudes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la solicitud");
      }

      router.push(`/solicitudes/${data.solicitud.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <span>Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar usuario={usuario} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera y botón regresar */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al listado de solicitudes</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Registrar Solicitud de Actualización de Contenido
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete los campos requeridos para que la oficina TEIN proceda a realizar las modificaciones en el portal de la UPT.
          </p>
        </div>

        {/* Guía informativa de TEIN */}
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 mb-6 flex items-start space-x-3 text-blue-200">
          <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-blue-300">
              Instrucciones de la Oficina TEIN:
            </p>
            <p>
              • Adjunte el documento Word con el texto revisado y aprobado por su jefatura o decanato.
            </p>
            <p>
              • Si requiere actualizar imágenes, banners o fotografías, adjúntelas en formato JPG o PNG en alta resolución.
            </p>
            <p>
              • Indique con precisión la sección o URL del portal institucional a modificar.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 flex items-start space-x-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Datos del solicitante (Readonly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Departamento / Facultad Emisora:</span>
              <span className="font-bold text-white text-sm">{usuario.departamento}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Responsable que envía:</span>
              <span className="font-bold text-white text-sm">{usuario.nombre}</span>
            </div>
          </div>

          {/* Título de la Solicitud */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Título descriptivo del requerimiento <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Actualización de Plan Curricular 2026 - Carrera Profesional de Ing. de Sistemas"
              className="mt-1.5 w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Sección del portal web y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Sección o URL del Portal a modificar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={seccionPortal}
                onChange={(e) => setSeccionPortal(e.target.value)}
                placeholder="Ej. Portal FAING > Ing. de Sistemas > Plan Curricular"
                className="mt-1.5 w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Indique la ruta de navegación interna o el link de la página.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Nivel de Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="BAJA">Baja (Cambios menores o no urgentes)</option>
                <option value="MEDIA">Media (Actualización regular de información)</option>
                <option value="ALTA">Alta (Convocatorias, eventos con fecha próxima)</option>
                <option value="URGENTE">Urgente (Corrección de datos erróneos o campaña activa)</option>
              </select>
            </div>
          </div>

          {/* Detalle o Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Detalle explicativo de los cambios <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa puntualmente qué textos se deben cambiar, qué elementos eliminar o qué información nueva se debe incorporar..."
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
            />
          </div>

          {/* Subida de Archivos Adjuntos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Documentos y Archivos Adjuntos (Word, PDF, Imágenes)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
              <UploadCloud className="w-10 h-10 mx-auto text-slate-500 mb-2" />
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer font-semibold text-blue-400 hover:text-blue-300 focus-within:outline-none text-sm"
              >
                <span>Haga clic para seleccionar archivos</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".docx,.doc,.pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Formatos permitidos: Word (.docx, .doc), PDF (.pdf), Imágenes (.png, .jpg). Hasta 10 MB por archivo.
              </p>
            </div>

            {/* Lista de archivos adjuntos pre-cargados */}
            {archivos.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Archivos a subir ({archivos.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {archivos.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate text-slate-200">{file.name}</span>
                        <span className="text-slate-500 text-[10px]">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Enviando requerimiento...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar a TEIN</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
