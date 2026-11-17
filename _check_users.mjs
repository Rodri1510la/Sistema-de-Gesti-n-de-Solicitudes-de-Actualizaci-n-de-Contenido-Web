process.loadEnvFile(".env");
const { PrismaClient } = await import("@prisma/client");
const p = new PrismaClient();
const users = await p.usuario.findMany({ select: { id: true, email: true, rol: true, activo: true } });
console.log(JSON.stringify(users, null, 2));
await p.$disconnect();
