const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
if (!fs.existsSync(".env")) {
  fs.copyFileSync(".env.example", ".env");
  console.log(
    "Arquivo .env criado. Confira as credenciais PostgreSQL antes de continuar.",
  );
}
for (const args of [
  ["run", "migration:run"],
  ["run", "seed"],
  ["run", "seed:demo"],
]) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(
  "CampusLab preparado! Execute npm run dev e abra http://localhost:5173",
);
