export const APP_TITLE = "Bank Churn Minimal Deployable ML";

export const PROJECT_SUMMARY =
  "  A browser-based demo that estimates bank customer churn risk from a customer"+
  "profile. Enter account and demographic attributes, or choose an example profile,"+
  " to see how a lightweight predictive model can support retention-focused decision"+
  "making.";

// Files in public/ are served from the site root by Vite.
// Source: public/artifacts/deployment/best_model.onnx
// URL:    ./artifacts/deployment/best_model.onnx
export const APP_BASE_URL = import.meta.env.BASE_URL || "./";
export const ARTIFACT_ROOT = `${APP_BASE_URL}artifacts`;
export const DEPLOYMENT_ARTIFACT_DIR = `${ARTIFACT_ROOT}/deployment`;

export const MODEL_PATH = `${DEPLOYMENT_ARTIFACT_DIR}/best_model.onnx`;
export const PREPROCESSING_SCHEMA_PATH = `${DEPLOYMENT_ARTIFACT_DIR}/preprocessing_schema.json`;
export const DEPLOYMENT_MANIFEST_PATH = `${DEPLOYMENT_ARTIFACT_DIR}/deployment_manifest.json`;
export const EXAMPLE_INPUTS_PATH = `${APP_BASE_URL}example_inputs.json`;

// Canonical path is ./artifacts/ort-wasm/. The fallback ./ort-wasm/ is included
// only so the current local project can run while the folder cleanup is in progress.
export const ORT_WASM_PATH = `${APP_BASE_URL}artifacts/ort-wasm/`;
export const ORT_WASM_FALLBACK_PATHS = [
  `${APP_BASE_URL}artifacts/ort-wasm/`,
  `${APP_BASE_URL}ort-wasm/`
];

export const PROJECT_LINKS = {
  webRepo: "https://github.com/luisaespinoza/rml-bank-churn-web-app",
  trainingRepo: "https://github.com/luisaespinoza/rml-bank-churn-training",
  githubProfile: "https://github.com/luisaespinoza",
  contactEmail: "YOUR_EMAIL_HERE"
};
export const REQUIRED_DEPLOYMENT_FILES = [
  {
    label: "ONNX model",
    path: MODEL_PATH,
    required: true,
    source: "Exported by the training repo from artifacts/models/tiny.pt or another selected .pt checkpoint."
  },
  {
    label: "Preprocessing schema",
    path: PREPROCESSING_SCHEMA_PATH,
    required: true,
    source: "Exported by the fitted train-only preprocessing pipeline."
  },
  {
    label: "Deployment manifest",
    path: DEPLOYMENT_MANIFEST_PATH,
    required: false,
    source: "Metadata from the training repo."
  },
  {
    label: "ONNX Runtime Web wasm files",
    path: ORT_WASM_PATH,
    required: true,
    source: "Created by npm run copy:ort. Fallback path ./ort-wasm/ is also tried."
  }
];

export const TARGET_COLUMN = "Exited";

export const NUMERIC_COLUMNS = [
  "CreditScore",
  "Age",
  "Tenure",
  "Balance",
  "NumOfProducts",
  "HasCrCard",
  "IsActiveMember",
  "EstimatedSalary"
];

export const CATEGORICAL_COLUMNS = ["Geography", "Gender"];

export const FEATURE_COLUMNS = [
  "CreditScore",
  "Geography",
  "Gender",
  "Age",
  "Tenure",
  "Balance",
  "NumOfProducts",
  "HasCrCard",
  "IsActiveMember",
  "EstimatedSalary"
];

export const FALLBACK_EXAMPLES = [
  {
    id: "balanced-baseline",
    label: "Balanced baseline",
    description: "A middle-of-the-road customer profile for a quick sanity check.",
    inputs: {
      CreditScore: 650,
      Geography: "France",
      Gender: "Female",
      Age: 40,
      Tenure: 5,
      Balance: 60000,
      NumOfProducts: 2,
      HasCrCard: 1,
      IsActiveMember: 1,
      EstimatedSalary: 100000
    }
  }
];

export const DEFAULT_INPUTS = {
  CreditScore: 650,
  Geography: "France",
  Gender: "Female",
  Age: 40,
  Tenure: 5,
  Balance: 60000,
  NumOfProducts: 2,
  HasCrCard: 1,
  IsActiveMember: 1,
  EstimatedSalary: 100000
};

export const FALLBACK_CATEGORIES = {
  Geography: ["France", "Germany", "Spain"],
  Gender: ["Female", "Male"]
};

export const RESPONSIBLE_USE_COPY =
  "Educational portfolio demo only. User-entered values stay in the browser for local inference; this app does not collect, store, or transmit user input. Do not use this app for production banking, lending, credit, eligibility, or customer-treatment decisions without independent validation, fairness analysis, privacy review, security review, and compliance approval.";

export const MODEL_FACTS = [
  "Local browser inference: no backend and no API keys",
  "No user-entered data is collected, stored, or transmitted",
  "Consumes ONNX + preprocessing schema from the training repo",
  "Output is a churn-probability estimate, not a customer decision",
  "Runs entirely from static files after the artifacts are copied"
];
