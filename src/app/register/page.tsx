"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { DEPARTAMENTOS } from "@/lib/departamentos";

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!DEPARTAMENTOS.some((item) => item === departamento)) {
      setError("Selecciona un departamento válido de la lista");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          password,
          departamento,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar cuenta");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/login"
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Registro de Departamento / Solicitante
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Cree una cuenta para enviar solicitudes de cambios en el portal web institucional
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/60">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 flex items-start space-x-3 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-start space-x-3 text-emerald-200">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div className="text-sm font-medium">
                ¡Cuenta registrada exitosamente! Redirigiendo al login...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Nombre y Apellidos del Responsable
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ing. Juan Pérez"
                className="mt-1 w-full px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Correo Electrónico Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jperez@upt.pe"
                className="mt-1 w-full px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 w-full px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Departamento o Facultad
              </label>
              <select
                required
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="" disabled>
                  Selecciona tu departamento
                </option>
                {DEPARTAMENTOS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Registrando cuenta...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Completar Registro</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
