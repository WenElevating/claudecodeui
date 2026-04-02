/**
 * Architecture Constraint Tests
 *
 * Structural tests that verify the project's architecture invariants.
 * These catch violations that linters cannot — dependency direction,
 * file size limits, and module boundaries.
 *
 * Run: node tests/structure/architecture.test.js
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) {
    failed++;
    failures.push(message);
    console.log(`  FAIL: ${message}`);
  } else {
    passed++;
    console.log(`  PASS`);
  }
}

function getAllFiles(dir, extensions, exclude = []) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (exclude.some((ex) => fullPath.includes(ex))) continue;
      if (entry.name.startsWith(".")) continue;
      if (entry.isDirectory()) {
        results.push(...getAllFiles(fullPath, extensions, exclude));
      } else if (extensions.includes(extname(entry.name))) {
        results.push(fullPath);
      }
    }
  } catch {
    // directory might not exist
  }
  return results;
}

function getImports(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const imports = [];
  // Match static imports: import ... from '...'
  const staticRe =
    /import\s+(?:[\w{},\s*]*\s+from\s+)?['"]([^'"]+)['"]/g;
  // Match dynamic imports: import('...')
  const dynamicRe = /import\(['"]([^'"]+)['"]\)/g;
  let match;
  while ((match = staticRe.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = dynamicRe.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

const ROOT = new URL("../..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

// ---------------------------------------------------------------------------
console.log("\n1. Dependency direction: src/ must not import from server/");
console.log("=".repeat(60));
const srcFiles = getAllFiles(
  join(ROOT, "src"),
  [".ts", ".tsx", ".js", ".jsx"],
  ["node_modules"]
);
for (const file of srcFiles) {
  const imports = getImports(file);
  const serverImports = imports.filter(
    (imp) => imp.includes("server/") || imp.startsWith("../server")
  );
  assert(
    serverImports.length === 0,
    `${file.replace(ROOT, "")} imports from server/: ${serverImports.join(", ")}`
  );
}

// ---------------------------------------------------------------------------
console.log("\n2. Dependency direction: server/ must not import from src/");
console.log("=".repeat(60));
const serverFiles = getAllFiles(
  join(ROOT, "server"),
  [".js"],
  ["node_modules"]
);
for (const file of serverFiles) {
  const imports = getImports(file);
  const srcImports = imports.filter(
    (imp) => imp.includes("src/") || imp.startsWith("../src")
  );
  assert(
    srcImports.length === 0,
    `${file.replace(ROOT, "")} imports from src/: ${srcImports.join(", ")}`
  );
}

// ---------------------------------------------------------------------------
console.log("\n3. File size: no files should exceed 800 lines");
console.log("=".repeat(60));
const allSourceFiles = getAllFiles(
  join(ROOT, "src"),
  [".ts", ".tsx", ".js", ".jsx"],
  ["node_modules"]
);
const allServerFiles = getAllFiles(
  join(ROOT, "server"),
  [".js"],
  ["node_modules"]
);
const allFiles = [...allSourceFiles, ...allServerFiles];
for (const file of allFiles) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n").length;
  assert(
    lines <= 800,
    `${file.replace(ROOT, "")} is ${lines} lines (limit: 800)`
  );
}

// ---------------------------------------------------------------------------
console.log("\n4. Provider imports must go through registry");
console.log("=".repeat(60));
for (const file of serverFiles) {
  const rel = file.replace(ROOT, "");
  // Skip registry itself and the adapter files
  if (rel.includes("providers/registry") || rel.includes("providers/claude/adapter") || rel.includes("providers/cursor/adapter") || rel.includes("providers/codex/adapter") || rel.includes("providers/gemini/adapter")) {
    continue;
  }
  const content = readFileSync(file, "utf-8");
  const directProviderImports =
    content.match(/from\s+['"][^'"]*providers\/(claude|cursor|codex|gemini)\/adapter/mg) || [];
  assert(
    directProviderImports.length === 0,
    `${rel} imports provider adapter directly (use registry.js): ${directProviderImports.join(", ")}`
  );
}

// ---------------------------------------------------------------------------
console.log("\n5. No hardcoded secrets (API key patterns)");
console.log("=".repeat(60));
for (const file of allFiles) {
  const content = readFileSync(file, "utf-8");
  // Skip placeholder patterns (repeated 'x' characters)
  const secretPatterns = (content.match(
    /(?:sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{35}|ghp_[a-zA-Z0-9]{36})/g
  ) || []).filter((s) => !/(?:x{5,}|0{5,})/.test(s));
  assert(
    secretPatterns.length === 0,
    `${file.replace(ROOT, "")} contains hardcoded secret: ${secretPatterns[0]?.substring(0, 10)}...`
  );
}

// ---------------------------------------------------------------------------
console.log("\n" + "=".repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
console.log("\nAll architecture constraints satisfied.");
