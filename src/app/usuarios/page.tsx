"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Users,
  Building,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle,
  FileText,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface UsuarioItem {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  activo: boolean;
  createdAt: string;
  _count: {
    solicitudes: number;
  };
}

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        const authData = await authRes.json();
        if (authData.usuario.rol !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUsuarioActual(authData.usuario);

        const usersRes = await fetch("/api/usuarios");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsuarios(usersData.usuarios || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading || !usuarioActual) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar usuario={usuarioActual} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            <span>Gestión de Usuarios y Departamentos UPT</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Listado de facultades, áreas administrativas y personal autorizado para solicitar modificaciones web.
          </p>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Responsable</th>
                  <th className="px-6 py-4 font-semibold">Facultad / Departamento</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Solicitudes Enviadas</th>
                  <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                  <th className="px-6 py-4 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{u.nombre}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-200">
                        <Building className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="font-medium text-xs">{u.departamento}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.rol === "ADMIN" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          ADMIN TEIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          SOLICITANTE
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        {u._count.solicitudes} solicitud(es)
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.activo ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400">Inactivo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
