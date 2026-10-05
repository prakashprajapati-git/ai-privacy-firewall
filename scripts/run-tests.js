import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=========================================");
console.log("🧪 AI Privacy Firewall — Running Vitest Suite");
console.log("=========================================\n");

try {
  execSync("npx vitest run", {
    cwd: rootDir,
    stdio: "inherit",
  });
} catch (error) {
  process.exit(1);
}
