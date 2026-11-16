import React from "react";
import {
  Clock,
  Search,
  Cog,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  ArrowDown,
  Minus,
} from "lucide-react";

export function EstadoBadge({ estado }: { estado: string }) {
  switch (estado) {
    case "PENDIENTE":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3 mr-1" />
          Pendiente
        </span>
      );
    case "EN_REVISION":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
          <Search className="w-3 h-3 mr-1" />
          En Revisión
        </span>
      );
    case "EN_PROCESO":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <Cog className="w-3 h-3 mr-1 animate-spin" />
          En Proceso
        </span>
      );
    case "COMPLETADO":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completado
        </span>
      );
    case "RECHAZADO":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          {estado}
        </span>
      );
  }
}

export function PrioridadBadge({ prioridad }: { prioridad: string }) {
  switch (prioridad) {
    case "URGENTE":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
          <Flame className="w-3 h-3 mr-1 text-rose-600" />
          Urgente
        </span>
      );
    case "ALTA":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300">
          <AlertTriangle className="w-3 h-3 mr-1 text-orange-600" />
          Alta
        </span>
      );
    case "MEDIA":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          <Minus className="w-3 h-3 mr-1 text-slate-500" />
          Media
        </span>
      );
    case "BAJA":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowDown className="w-3 h-3 mr-1 text-emerald-600" />
          Baja
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {prioridad}
        </span>
      );
  }
}
