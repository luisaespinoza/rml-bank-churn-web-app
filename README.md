# RML Bank Churn Browser App

A static browser demo for **minimal deployable ML**: a compact bank-churn neural network runs locally in the browser with ONNX Runtime Web. There is no backend, no API key, and no paid cloud inference service.

This repository is the **web deployment app**. Model training, preprocessing export, benchmark comparison, and ONNX export live in the source training repository:

**Training source repo:** https://github.com/luisaespinoza/rml-bank-churn-training

## What this app demonstrates

This app shows that a useful ML deployment does not have to be a chatbot, LLM wrapper, hosted API, or cloud service. The training project selects a small ANN for browser deployment: it accepts a small performance tradeoff versus the stronger XGBoost benchmark in exchange for a smaller, portable, no-backend inference artifact.

The intended deployed model is the **Tiny ANN**:

```text
transformed input -> 32 -> 16 -> 1 logit
```

The app converts the model logit to a churn probability in JavaScript using sigmoid.

## Privacy

User-entered values are processed locally in the browser.

This app does **not** collect, store, upload, or transmit user-entered customer data. The form values are used only to build a local feature vector and run local ONNX inference in the browser session.

## Repository relationship

Use the training repo to produce deployment artifacts:

```text
rml-bank-churn-training/
├── artifacts/models/tiny.pt
├── artifacts/deployment/preprocessing_schema.json
├── artifacts/deployment/best_model.onnx
└── artifacts/deployment/deployment_manifest.json
```

Then copy the browser-ready artifacts into this web app:

```text
rml-bank-churn-web-app/
└── public/artifacts/deployment/
    ├── best_model.onnx
    ├── preprocessing_schema.json
    └── deployment_manifest.json
```

The web app should not train models or convert PyTorch checkpoints. It should only consume static deployment artifacts produced by the training repo.

## Required public artifact layout

```text
public/artifacts/
├── deployment/
│   ├── best_model.onnx
│   ├── preprocessing_schema.json
│   └── deployment_manifest.json
└── ort-wasm/
    └── ONNX Runtime Web wasm files
```

`public/artifacts/ort-wasm/` is the canonical ONNX Runtime wasm location. Do not also maintain `public/ort-wasm/` unless you are deliberately debugging path fallback behavior.

## Export the Tiny ANN from the training repo

From the training repository:

```bash
python export_ann_to_onnx.py
```

Expected result:

```text
artifacts/deployment/best_model.onnx
artifacts/deployment/deployment_manifest.json
```

The exporter should confirm the Tiny architecture:

```text
13 -> 32 -> 16 -> 1 (tiny)
```

If it detects `13 -> 64 -> 32 -> 1`, that is the Small ANN, not the intended browser-deployment model.

## Copy artifacts into this web app

From the training repo, adjust the destination path if your local folder name differs:

```bash
cp artifacts/deployment/best_model.onnx ../rml-bank-churn-web-app/public/artifacts/deployment/
cp artifacts/deployment/preprocessing_schema.json ../rml-bank-churn-web-app/public/artifacts/deployment/
cp artifacts/deployment/deployment_manifest.json ../rml-bank-churn-web-app/public/artifacts/deployment/
```

If you swap only the ONNX file, you usually do **not** need to delete `node_modules/.vite`. The ONNX file is served as a static public asset. Hard-refresh the browser if it appears cached.

## Setup

```bash
npm install
npm run copy:ort
npm run check:artifacts
npm run dev
```

Then open the Vite local URL shown in the terminal.

`npm run copy:ort` copies ONNX Runtime Web wasm support files into:

```text
public/artifacts/ort-wasm/
```

`npm run check:artifacts` verifies that the expected ONNX, preprocessing schema, manifest, and wasm files are present.

## Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Quick example profiles

The shortcut profiles in the UI are loaded from:

```text
public/example_inputs.json
```

Example entry:

```json
{
  "id": "balanced-baseline",
  "label": "Balanced baseline",
  "description": "A quick sanity-check profile.",
  "inputs": {
    "CreditScore": 650,
    "Geography": "France",
    "Gender": "Female",
    "Age": 40,
    "Tenure": 5,
    "Balance": 60000,
    "NumOfProducts": 2,
    "HasCrCard": 1,
    "IsActiveMember": 1,
    "EstimatedSalary": 100000
  }
}
```

The app lightly validates examples by retaining only fields that match the expected model inputs.

## Runtime diagnostics

Runtime diagnostics are available in the UI but collapsed by default. Use them to check:

- whether ONNX Runtime loaded,
- which wasm path is active,
- model input and output names,
- preprocessing vector length,
- whether scaler metadata is available,
- raw logit and probability behavior.

If predictions collapse to `<0.1%` or `>99.9%` for many normal-looking examples, check preprocessing first. The browser feature vector must match the Python preprocessing exactly.

## Preprocessing contract

The browser app expects the training repo to export preprocessing metadata that matches the fitted Python pipeline:

- numeric columns use train-fitted `StandardScaler` means and scales,
- categorical columns use one-hot encoding with unknown categories ignored,
- feature order must match the model's training-time feature order.

The model input size is expected to be 13 for the current dataset configuration:

```text
8 numeric features + Geography one-hot categories + Gender one-hot categories = 13 transformed features
```

## Responsible use

This is a portfolio and educational demo. It is not intended for production banking, lending, credit, retention, or customer treatment decisions.

A real deployment would require stronger validation, monitoring, fairness analysis, privacy/security review, compliance review, and domain-specific approval.

