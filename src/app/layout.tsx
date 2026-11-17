import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DARK_THEME_VARIABLES } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SGSACW | TEIN - Universidad Privada de Tacna",
  description:
    "Sistema de Gestión de Solicitudes de Actualización de Contenido Web - Oficina de Tecnologías de la Información UPT",
};

const themeInitializationScript = `
  try {
    if (localStorage.getItem("sgsacw-theme") === "dark") {
      const root = document.documentElement;
      root.dataset.theme = "dark";
      const variables = ${JSON.stringify(DARK_THEME_VARIABLES)};
      Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value));
    }
  } catch {
    document.documentElement.dataset.theme = "light";
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="sgsacw-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
