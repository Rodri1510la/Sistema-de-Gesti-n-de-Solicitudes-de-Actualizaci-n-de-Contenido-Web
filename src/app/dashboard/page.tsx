"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { EstadoBadge, PrioridadBadge } from "@/components/Badges";
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

interface Solicitud {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  seccionPortal: string;
  prioridad: string;
  estado: string;
  createdAt: string;
  solicitante: {
    id: number;
    nombre: string;
    departamento: string;
    email: string;
  };
  archivos: Array<{
    id: number;
    nombreOriginal: string;
    tamano: number;
  }>;
  _count: {
    historiales: number;
    archivos: number;
  };
}

interface Stats {
  total: number;
  pendientes: number;
  enProceso: number;
  completadas: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [prioridadFiltro, setPrioridadFiltro] = useState("TODAS");
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");

  // Cargar usuario autenticado
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

  // Cargar solicitudes con filtros
  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (estadoFiltro !== "TODOS") params.append("estado", estadoFiltro);
      if (prioridadFiltro !== "TODAS") params.append("prioridad", prioridadFiltro);
      if (departamentoFiltro) params.append("departamento", departamentoFiltro);

      const res = await fetch(`/api/solicitudes?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener solicitudes");
      const data = await res.json();
      setSolicitudes(data.solicitudes || []);
      setStats(
        data.stats || { total: 0, pendientes: 0, enProceso: 0, completadas: 0 }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      fetchSolicitudes();
    }
  }, [usuario, estadoFiltro, prioridadFiltro, departamentoFiltro]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSolicitudes();
  };

  const limpiarFiltros = () => {
    setSearch("");
    setEstadoFiltro("TODOS");
    setPrioridadFiltro("TODAS");
    setDepartamentoFiltro("");
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Cargando sesión...</span>
        </div>
      </div>
    );
  }

  const isAdmin = usuario.rol === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar usuario={usuario} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado y Acción Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{isAdmin ? "Panel General de Solicitudes TEIN" : "Mis Solicitudes de Actualización"}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isAdmin
                ? "Supervise y atienda los requerimientos de actualización de portales web enviados por todas las facultades."
                : `Solicitudes registradas para el portal web por: ${usuario.departamento}`}
            </p>
          </div>

          <div>
            <Link
              href="/solicitudes/nueva"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Solicitud</span>
            </Link>
          </div>
        </div>

        {/* Tarjetas de Resumen Estadístico */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <button
            onClick={() => setEstadoFiltro("TODOS")}
            className={`p-4 rounded-xl border text-left transition-all ${
              estadoFiltro === "TODOS"
                ? "bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/30"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Solicitudes</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
            <span className="text-[11px] text-slate-500">Histórico acumulado</span>
          </button>

          <button
            onClick={() => setEstadoFiltro("PENDIENTE")}
            className={`p-4 rounded-xl border text-left transition-all ${
              estadoFiltro === "PENDIENTE"
                ? "bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30"
                : "bg-slate-900/60 border-slate-800 hover:border-amber-900/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-amber-400">Pendientes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-300 mt-2">{stats.pendientes}</p>
            <span className="text-[11px] text-slate-500">Por atender</span>
          </button>

          <button
            onClick={() => setEstadoFiltro("EN_PROCESO")}
            className={`p-4 rounded-xl border text-left transition-all ${
              estadoFiltro === "EN_PROCESO"
                ? "bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/30"
                : "bg-slate-900/60 border-slate-800 hover:border-blue-900/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-blue-400">En Trabajo</span>
              <RefreshCw className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-300 mt-2">{stats.enProceso}</p>
            <span className="text-[11px] text-slate-500">Revisión o desarrollo</span>
          </button>

          <button
            onClick={() => setEstadoFiltro("COMPLETADO")}
            className={`p-4 rounded-xl border text-left transition-all ${
              estadoFiltro === "COMPLETADO"
                ? "bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/30"
                : "bg-slate-900/60 border-slate-800 hover:border-emerald-900/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-emerald-400">Completadas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-300 mt-2">{stats.completadas}</p>
            <span className="text-[11px] text-slate-500">Publicadas en el portal</span>
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mt-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código, título, sección del portal o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium border border-slate-700 text-slate-200 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Filtros avanzados */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros:
            </span>

            {/* Filtro Estado */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="COMPLETADO">Completados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>

            {/* Filtro Prioridad */}
            <select
              value={prioridadFiltro}
              onChange={(e) => setPrioridadFiltro(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TODAS">Todas las Prioridades</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>

            {/* Filtro Departamento (Solo Admin) */}
            {isAdmin && (
              <input
                type="text"
                placeholder="Filtrar por departamento..."
                value={departamentoFiltro}
                onChange={(e) => setDepartamentoFiltro(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
              />
            )}

            {(search || estadoFiltro !== "TODOS" || prioridadFiltro !== "TODAS" || departamentoFiltro) && (
              <button
                onClick={limpiarFiltros}
                className="text-blue-400 hover:text-blue-300 underline ml-auto text-xs"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="mt-6 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-sm">Cargando solicitudes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="py-16 text-center px-4">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-200">
                No se encontraron solicitudes
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                No hay requerimientos que coincidan con los criterios de búsqueda o aún no ha registrado ninguna solicitud.
              </p>
              <div className="mt-5">
                <Link
                  href="/solicitudes/nueva"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear nueva solicitud</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Código & Prioridad
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Título y Sección del Portal
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Departamento Solicitante
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Estado
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Fecha
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {solicitudes.map((sol) => (
                    <tr
                      key={sol.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Código y Prioridad */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-blue-400">
                          {sol.codigo}
                        </div>
                        <div className="mt-1">
                          <PrioridadBadge prioridad={sol.prioridad} />
                        </div>
                      </td>

                      {/* Título y Sección */}
                      <td className="px-5 py-4 max-w-md">
                        <Link
                          href={`/solicitudes/${sol.id}`}
                          className="font-semibold text-white group-hover:text-blue-400 transition-colors block text-sm"
                        >
                          {sol.titulo}
                        </Link>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          🎯 {sol.seccionPortal}
                        </p>
                        {sol.archivos && sol.archivos.length > 0 && (
                          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                            <span>📎 {sol.archivos.length} archivo(s) adjunto(s)</span>
                          </div>
                        )}
                      </td>

                      {/* Solicitante */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-200">
                          {sol.solicitante?.departamento}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sol.solicitante?.nombre}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <EstadoBadge estado={sol.estado} />
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                        {new Date(sol.createdAt).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Botón Acción */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/solicitudes/${sol.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAdmin ? "Gestionar" : "Detalle"}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
