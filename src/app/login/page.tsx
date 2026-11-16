"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Shield, Building, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Institucional */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
          UPT
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          SGSACW — TEIN
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Sistema de Gestión de Solicitudes de Actualización de Contenido Web
        </p>
        <p className="text-xs text-blue-400 font-medium">
          Oficina de Tecnologías de la Información — Universidad Privada de Tacna
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/60">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 flex items-start space-x-3 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Correo Electrónico Institucional
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@upt.pe"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Contraseña
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar al Sistema</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Cuentas de Acceso Rápido para Demostración */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-3">
              Cuentas de prueba para demostración
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickFill("admin.tein@upt.pe", "admin123")}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">
                      Administrador TEIN
                    </p>
                    <p className="text-[11px] text-slate-400">admin.tein@upt.pe</p>
                  </div>
                </div>
                <span className="text-xs text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Cargar
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickFill("ingenieria@upt.pe", "user123")}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">
                      Facultad de Ingeniería (FAING)
                    </p>
                    <p className="text-[11px] text-slate-400">ingenieria@upt.pe</p>
                  </div>
                </div>
                <span className="text-xs text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Cargar
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickFill("admision@upt.pe", "user123")}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-blue-400">
                      Dirección de Admisión
                    </p>
                    <p className="text-[11px] text-slate-400">admision@upt.pe</p>
                  </div>
                </div>
                <span className="text-xs text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Cargar
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              ¿Representas a un nuevo departamento?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-400 hover:text-blue-300 underline inline-flex items-center space-x-1"
              >
                <span>Registrar nueva cuenta</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
