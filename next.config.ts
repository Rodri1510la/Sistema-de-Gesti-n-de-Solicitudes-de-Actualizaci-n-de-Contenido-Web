import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lee sus fuentes (.afm) del sistema de archivos en tiempo de ejecución,
  // por eso debe resolverse con require nativo y viajar en el bundle serverless.
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/solicitudes/[id]/acta": [
      "./node_modules/pdfkit/js/data/**/*",
      "./public/upt_logo.png",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
