# ONNX Runtime Web wasm files

This directory is the canonical wasm location for this app:

`public/artifacts/ort-wasm/`

The browser URL used by the app is:

`./artifacts/ort-wasm/`

Populate it with:

```bash
npm install
npm run copy:ort
```

Do not also use `public/ort-wasm/`; keeping one wasm path avoids deployment ambiguity.
