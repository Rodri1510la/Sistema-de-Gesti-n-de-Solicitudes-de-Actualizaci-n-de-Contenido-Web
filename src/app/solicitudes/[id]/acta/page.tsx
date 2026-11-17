"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft } from "lucide-react";

interface Archivo {
  id: number;
  nombreOriginal: string;
  tamano: number;
}

interface HistorialItem {
  id: number;
  accion: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  comentario: string | null;
  createdAt: string;
  usuario: {
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
  };
  archivos: Archivo[];
  historiales: HistorialItem[];
}

export default function ActaConformidadPage() {
  const params = useParams();
  const solicitudId = params?.id as string;
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/solicitudes/${solicitudId}`);
        if (res.ok) {
          const data = await res.json();
          setSolicitud(data.solicitud);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [solicitudId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <p className="text-sm">Generando acta de conformidad...</p>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <p className="text-sm">No se encontró la información de la solicitud.</p>
      </div>
    );
  }

  if (solicitud.estado !== "COMPLETADO" || !solicitud.fechaCompletado) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300 gap-4">
        <p className="text-sm">El acta estará disponible cuando la solicitud esté completada.</p>
        <Link href={`/solicitudes/${solicitud.id}`} className="text-sm text-blue-400 hover:text-blue-300">
          Volver a la solicitud
        </Link>
      </div>
    );
  }

  const detalleCierre =
    solicitud.historiales.find((h) => h.estadoNuevo === "COMPLETADO")?.comentario?.trim() ||
    "Sin detalle de cierre registrado.";

  return (
    <div className="min-h-screen bg-slate-200 py-6 px-4 text-slate-900 print:bg-white print:p-0 print:m-0">
      {/* Barra superior de acciones (Se oculta al imprimir) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-lg print:hidden">
        <Link
          href={`/solicitudes/${solicitud.id}`}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Sistema</span>
        </Link>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">Vista previa del documento oficial</span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* Hoja Formal A4 Membretada (Apta para impresión y PDF) */}
      <div className="acta-doc max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-2xl rounded-lg border border-slate-300 print:shadow-none print:border-none print:p-6 print:max-w-none text-slate-900 font-sans text-xs sm:text-sm">
        {/* Encabezado Institucional UPT */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/upt_logo.png"
              alt="Escudo de la Universidad Privada de Tacna"
              width={56}
              height={70}
              className="h-14 w-12 object-contain"
            />
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight uppercase text-blue-950 leading-tight">
                Universidad Privada de Tacna
              </h1>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Oficina de Tecnologías de la Información (TEIN)
              </p>
              <p className="text-[11px] text-slate-500">
                Área de Desarrollo y Administración de Portales Web Institucionales
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 font-mono text-xs font-bold text-blue-950 rounded">
              ACTA N° {solicitud.codigo}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Tacna, Perú</p>
          </div>
        </div>

        {/* Título del Documento */}
        <div className="text-center my-6">
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide underline underline-offset-4">
            Acta de Conformidad y Ficha Técnica de Actualización Web
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Constancia formal de atención, ejecución y publicación de requerimientos de contenido en el portal institucional
          </p>
        </div>

        {/* Sección I: Datos Generales */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-blue-900 text-blue-950 mb-3">
            I. Datos Generales de la Solicitud
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-2 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Código de Solicitud:</span>{" "}
              <span className="font-mono font-bold text-blue-900">{solicitud.codigo}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Nivel de Prioridad:</span>{" "}
              <span className="font-bold uppercase text-slate-900">{solicitud.prioridad}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Dependencia / Facultad:</span>{" "}
              <span className="font-medium text-slate-900">{solicitud.solicitante.departamento}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Fecha y Hora de Recepción:</span>{" "}
              <span className="text-slate-900">
                {new Date(solicitud.createdAt).toLocaleString("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Lima",
                })}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-slate-700">Responsable que remite:</span>{" "}
              <span className="text-slate-900">
                {solicitud.solicitante.nombre} ({solicitud.solicitante.email})
              </span>
            </div>
          </div>
        </div>

        {/* Sección II: Detalle del Contenido Web */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-blue-900 text-blue-950 mb-3">
            II. Especificación del Contenido y Secciones Afectadas
          </h3>
          <div className="space-y-3 px-2 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Título del Requerimiento:</span>
              <p className="text-slate-900 font-bold mt-0.5">{solicitud.titulo}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Sección o URL del Portal Modificada:</span>
              <p className="text-blue-900 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-200 mt-0.5">
                {solicitud.seccionPortal}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Descripción del cambio solicitado:</span>
              <div className="text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 mt-0.5 whitespace-pre-wrap leading-relaxed text-xs">
                {solicitud.descripcion}
              </div>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Documentación y Archivos de Sustento Entregados:</span>
              {solicitud.archivos.length === 0 ? (
                <p className="text-slate-500 italic mt-0.5">Sin archivos adjuntos anexos.</p>
              ) : (
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-700 text-[11px]">
                  {solicitud.archivos.map((a) => (
                    <li key={a.id}>
                      <span className="font-medium">{a.nombreOriginal}</span>{" "}
                      <span className="text-slate-500">({(a.tamano / 1024).toFixed(0)} KB)</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Sección III: Dictamen Técnico de la Oficina TEIN */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 p-2 border-l-4 border-blue-900 text-blue-950 mb-3">
            III. Dictamen Técnico y Estado de Publicación
          </h3>
          <div className="grid grid-cols-2 gap-4 px-2 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Estado Técnico Final:</span>{" "}
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  solicitud.estado === "COMPLETADO"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-blue-100 text-blue-900 border border-blue-300"
                }`}
              >
                {solicitud.estado === "COMPLETADO" ? "PUBLICADO EN PRODUCCIÓN (CONCLUIDO)" : solicitud.estado}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Fecha de publicación en el portal:</span>{" "}
              <span className="text-slate-900 font-medium">
                {new Date(solicitud.fechaCompletado).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "America/Lima",
                    })}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-slate-700 block">Detalle de los cambios publicados:</span>
              <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1 italic text-xs">
                &ldquo;{detalleCierre}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Sección IV: Firmas y Sellos de Conformidad */}
        <div className="mt-16 pt-8 border-t border-slate-300">
          <p className="text-center text-[11px] text-slate-500 mb-12">
            En señal de conformidad con los cambios realizados en el portal web de la Universidad Privada de Tacna, suscriben:
          </p>
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            {/* Firma TEIN */}
            <div className="flex flex-col items-center">
              <div className="w-56 border-b border-slate-800 mb-2"></div>
              <p className="font-bold text-slate-900 uppercase">Jefatura de la Oficina TEIN</p>
              <p className="text-[11px] text-slate-600">Tecnologías de la Información - UPT</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Sello y Firma Digital / Manuscrita</p>
            </div>

            {/* Firma Solicitante */}
            <div className="flex flex-col items-center">
              <div className="w-56 border-b border-slate-800 mb-2"></div>
              <p className="font-bold text-slate-900 uppercase">{solicitud.solicitante.nombre}</p>
              <p className="text-[11px] text-slate-600 uppercase">
                Decano / Director solicitante · {solicitud.solicitante.departamento}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Conformidad del Área Usuaria</p>
            </div>
          </div>
        </div>

        {/* Pie de página institucional */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Documento generado automáticamente por el Sistema de Gestión de Solicitudes de Actualización Web (SGSACW) — Universidad Privada de Tacna
        </div>
      </div>
    </div>
  );
}
