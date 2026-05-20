const fs = require("fs");
const path = require("path");

const requiredFiles = [
  path.join("public", "artifacts", "deployment", "best_model.onnx"),
  path.join("public", "artifacts", "deployment", "preprocessing_schema.json")
];

const wasmDirs = [
  path.join("public", "artifacts", "ort-wasm"),
  path.join("public", "ort-wasm")
];

let ok = true;

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    ok = false;
    console.error(`Missing required file: ${file}`);
  } else if (fs.statSync(file).size === 0) {
    ok = false;
    console.error(`Required file is empty: ${file}`);
  }
}

const wasmDirOk = wasmDirs.some((dir) => {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((file) => file.endsWith(".wasm"));
});

if (!wasmDirOk) {
  ok = false;
  console.error(`Missing ONNX Runtime wasm files. Expected .wasm files in one of: ${wasmDirs.join(", ")}`);
}

if (!ok) {
  console.error("\nExpected artifact layout:");
  console.error("public/artifacts/deployment/best_model.onnx");
  console.error("public/artifacts/deployment/preprocessing_schema.json");
  console.error("public/artifacts/deployment/deployment_manifest.json optional");
  console.error("public/artifacts/ort-wasm/*.wasm created by npm run copy:ort");
  process.exit(1);
}

console.log("Deployment artifacts look present.");
