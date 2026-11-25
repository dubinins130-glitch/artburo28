// Сборка для статического хостинга: npm run build:static
// Результат появится в папке out/. Укажите NEXT_PUBLIC_SITE_URL перед сборкой.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, STATIC_EXPORT: "1" },
});

process.exit(result.status ?? 1);
