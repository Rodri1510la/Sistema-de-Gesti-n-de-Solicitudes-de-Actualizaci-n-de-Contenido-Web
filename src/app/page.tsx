import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import {
  Shield,
  FileCheck2,
  Clock,
  ArrowRight,
  LogIn,
  Server,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  // Si ya tiene sesión activa, redirigir al dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/upt_logo.png"
              alt="Escudo UPT"
              width={40}
              height={50}
              className="h-10 w-9 rounded-md bg-white object-contain p-0.5"
            />
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                Oficina TEIN
              </span>
              <span className="text-[11px] text-slate-400 block leading-none">
                Universidad Privada de Tacna
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
            <Server className="w-3.5 h-3.5" />
            <span>Plataforma Oficial de Gestión de Contenido Web</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Sistema de Gestión de Solicitudes de Actualización Web
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Canal institucional centralizado para que facultades, decanatos y direcciones de la
            Universidad Privada de Tacna gestionen requerimientos de actualización de páginas y portales.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              <span>Registrar Departamento</span>
            </Link>
          </div>

          {/* 3 Pilares del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Recepción Digital
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reemplace el envío manual de documentos Word por un formulario estandarizado con archivos adjuntos validados.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Trazabilidad y Estados
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seguimiento en tiempo real: desde Pendiente hasta Publicado en Producción, con bitácora detallada de cambios.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Control Centralizado TEIN
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Herramientas para que el equipo de soporte de TI priorice, gestione y confirme cada actualización realizada.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950/80">
        <p>
          Universidad Privada de Tacna — Oficina de Tecnologías de la Información (TEIN)
        </p>
        <p className="mt-1">
          Proyecto de Prácticas Pre-Profesionales — Practicante: Rodrigo Soto
        </p>
      </footer>
    </div>
  );
}
