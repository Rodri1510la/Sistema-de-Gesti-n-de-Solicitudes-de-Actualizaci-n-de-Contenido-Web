"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  PlusCircle,
  Users,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Menu,
  X,
} from "lucide-react";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
}

export default function Navbar({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isAdmin = usuario?.rol === "ADMIN";

  const navLinks = [
    {
      href: "/dashboard",
      label: "Solicitudes",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/solicitudes/nueva",
      label: "Nueva Solicitud",
      icon: PlusCircle,
      active: pathname === "/solicitudes/nueva",
    },
    ...(isAdmin
      ? [
          {
            href: "/usuarios",
            label: "Usuarios y Departamentos",
            icon: Users,
            active: pathname === "/usuarios",
          },
        ]
      : []),
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-blue-500 transition-colors">
                UPT
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight block leading-tight">
                  TEIN <span className="text-blue-400 font-normal">| SGSACW</span>
                </span>
                <span className="text-[11px] text-slate-400 block leading-none">
                  Gestión de Contenido Web
                </span>
              </div>
            </Link>

            {/* Links Desktop */}
            <nav className="hidden md:flex items-center space-x-1 ml-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      link.active
                        ? "bg-slate-800 text-blue-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Perfil & Logout Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-sm font-semibold text-slate-200">
                  {usuario.nombre}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    ADMIN TEIN
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <Building2 className="w-3 h-3 mr-1" />
                    DEPARTAMENTO
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 block truncate max-w-[220px]">
                {usuario.departamento}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Botón Mobile Menu */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu desplegable Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 px-4 pt-3 pb-4 space-y-3 bg-slate-900">
          <div className="pb-2 border-b border-slate-800">
            <p className="text-sm font-semibold text-white">{usuario.nombre}</p>
            <p className="text-xs text-slate-400">{usuario.departamento}</p>
            <span className="mt-1 inline-block text-[11px] font-semibold text-blue-400">
              {isAdmin ? "Rol: Administrador TEIN" : "Rol: Solicitante"}
            </span>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    link.active
                      ? "bg-slate-800 text-blue-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </header>
  );
}
