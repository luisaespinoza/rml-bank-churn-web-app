import {
  APP_TITLE,
  DEPLOYMENT_MANIFEST_PATH,
  MODEL_FACTS,
  PROJECT_SUMMARY,
  REQUIRED_DEPLOYMENT_FILES,
  RESPONSIBLE_USE_COPY
} from "./constants.js";
import { INPUT_FIELDS, coerceFormValue, getInitialInputs } from "./inputs.js";
import { interpretChurnRisk } from "./interpretation.js";
import { getModelRuntimeInfo, loadModel, predictChurnProbability } from "./model.js";
import { describePreprocessing, loadPreprocessingSchema, preprocessInput } from "./preprocessing.js";

export function createApp(root) {
  const state = {
    inputs: getInitialInputs(),
    schema: null,
    session: null,
    manifest: null,
    loading: true,
    running: false,
    error: "",
    setupWarnings: [],
    result: null,
    debug: null
  };

  async function init() {
    render();
    const warnings = [];

    try {
      state.manifest = await loadDeploymentManifest().catch((error) => {
        warnings.push(`Manifest not loaded: ${error.message || String(error)}`);
        return null;
      });

      state.schema = await loadPreprocessingSchema();
      state.session = await loadModel();
      state.error = "";
    } catch (error) {
      state.error = error.message || String(error);
    } finally {
      state.setupWarnings = warnings;
      state.loading = false;
      updateDebug();
      render();
    }
  }

  async function loadDeploymentManifest() {
    const response = await fetch(DEPLOYMENT_MANIFEST_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error(`${DEPLOYMENT_MANIFEST_PATH} returned HTTP ${response.status}`);
    return response.json();
  }

  function readInputsFromForm(form) {
    const formData = new FormData(form);
    const nextInputs = { ...state.inputs };
    for (const field of INPUT_FIELDS) {
      nextInputs[field.name] = coerceFormValue(field, formData.get(field.name));
    }
    state.inputs = nextInputs;
    return nextInputs;
  }

  function updateInput(name, value) {
    const field = INPUT_FIELDS.find((item) => item.name === name);
    state.inputs[name] = coerceFormValue(field, value);
    state.result = null;
    render();
  }

  async function runPrediction(event) {
    event.preventDefault();
    readInputsFromForm(event.currentTarget);
    state.running = true;
    state.error = "";
    state.result = null;
    render();

    try {
      if (!state.schema) state.schema = await loadPreprocessingSchema();
      if (!state.session) state.session = await loadModel();

      const vector = preprocessInput(state.inputs, state.schema);
      const probability = await predictChurnProbability(vector, state.session);
      state.result = interpretChurnRisk(probability);
      updateDebug(vector);
    } catch (error) {
      state.error = error.message || String(error);
      updateDebug();
    } finally {
      state.running = false;
      render();
    }
  }

  function resetInputs() {
    state.inputs = getInitialInputs();
    state.result = null;
    state.error = "";
    updateDebug();
    render();
  }

  function updateDebug(vector = null) {
    const preprocessing = state.schema ? describePreprocessing(state.schema) : null;
    const runtime = getModelRuntimeInfo(state.session);
    state.debug = {
      modelLoaded: runtime.loaded,
      activeWasmPath: runtime.activeWasmPath || "not loaded",
      onnxInputs: runtime.inputNames,
      onnxOutputs: runtime.outputNames,
      vectorLength: vector?.length || preprocessing?.inputLength || null,
      numericColumns: preprocessing?.numericColumns || [],
      categoricalColumns: preprocessing?.categoricalColumns || [],
      categories: preprocessing?.categories || null
    };
  }

  function render() {
    root.innerHTML = `
      <main class="page-shell">
        <section class="hero card">
          <p class="eyebrow">Lightweight browser deployment</p>
          <h1>${APP_TITLE}</h1>
          <p class="summary">${PROJECT_SUMMARY}</p>
          <div class="fact-grid">
            ${MODEL_FACTS.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}
          </div>
        </section>

        <section class="layout-grid">
          <form class="card input-card" id="prediction-form">
            <div class="section-heading">
              <h2>Customer profile</h2>
              <p>Enter feature values from the bank churn dataset schema.</p>
            </div>
            <div class="field-grid">
              ${INPUT_FIELDS.map(renderField).join("")}
            </div>
            <div class="button-row">
              <button type="submit" class="primary-button" ${state.loading || state.running ? "disabled" : ""}>
                ${state.running ? "Running..." : "Estimate churn probability"}
              </button>
              <button type="button" class="secondary-button" id="reset-button">Reset</button>
            </div>
          </form>

          <aside class="card result-card">
            ${renderStatus()}
            ${renderResult()}
            ${renderModelDetails()}
            ${renderDebug()}
          </aside>
        </section>

        <section class="card artifact-card">
          ${renderArtifactChecklist()}
        </section>

        <section class="card caveat-card">
          <h2>Responsible use</h2>
          <p>${RESPONSIBLE_USE_COPY}</p>
        </section>
      </main>
    `;

    root.querySelector("#prediction-form")?.addEventListener("submit", runPrediction);
    root.querySelector("#reset-button")?.addEventListener("click", resetInputs);
    for (const field of INPUT_FIELDS) {
      const element = root.querySelector(`[name="${field.name}"]`);
      element?.addEventListener("input", (event) => updateInput(field.name, event.target.value));
      element?.addEventListener("change", (event) => updateInput(field.name, event.target.value));
    }
  }

  function renderField(field) {
    const value = state.inputs[field.name];

    if (field.type === "select") {
      return `
        <label class="field">
          <span>${escapeHtml(field.label)}</span>
          <select name="${field.name}">
            ${field.options.map((option) => {
              const optionValue = typeof option === "object" ? option.value : option;
              const optionLabel = typeof option === "object" ? option.label : option;
              return `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
            }).join("")}
          </select>
          <small>${escapeHtml(field.help)}</small>
        </label>
      `;
    }

    return `
      <label class="field">
        <span>${escapeHtml(field.label)}</span>
        <input
          name="${field.name}"
          type="${field.type}"
          min="${field.min}"
          max="${field.max}"
          step="${field.step}"
          value="${escapeHtml(value)}"
        />
        <small>${escapeHtml(field.help)}</small>
      </label>
    `;
  }

  function renderStatus() {
    if (state.loading) {
      return `<div class="status">Loading model and preprocessing schema...</div>`;
    }

    if (state.error) {
      return `<div class="status error"><strong>Setup/runtime issue:</strong> ${escapeHtml(state.error)}</div>`;
    }

    const warnings = state.setupWarnings.map((warning) => `<small>${escapeHtml(warning)}</small>`).join("");
    return `<div class="status ready">Ready: model and preprocessing schema loaded.${warnings}</div>`;
  }

  function renderArtifactChecklist() {
    return `
      <div class="artifact-checklist">
        <h2>Expected artifact layout</h2>
        <p class="small-note">Canonical wasm path: <code>public/artifacts/ort-wasm/</code>. Temporary fallback also tried: <code>public/ort-wasm/</code>.</p>
        <ul>
          ${REQUIRED_DEPLOYMENT_FILES.map((item) => `
            <li>
              <span>${item.required ? "Required" : "Optional"}</span>
              <code>${item.path}</code>
              <small>${item.source}</small>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  function renderResult() {
    if (!state.result) {
      return `
        <div class="empty-result">
          <h2>No estimate yet</h2>
          <p>Run the model to see a churn-probability estimate and plain-language interpretation.</p>
        </div>
      `;
    }

    return `
      <div class="prediction ${state.result.className}">
        <p class="prediction-label">Estimated churn probability</p>
        <strong>${state.result.probabilityText}</strong>
        <h2>${state.result.label}</h2>
        <p>${state.result.summary}</p>
        <small>${state.result.caveat}</small>
      </div>
    `;
  }

  function renderModelDetails() {
    const preprocessing = state.schema ? describePreprocessing(state.schema) : null;
    const manifestModel = state.manifest?.model_name || state.manifest?.selected_model || state.manifest?.detected_architecture || "best_model.onnx";

    return `
      <div class="model-details">
        <h2>Deployment details</h2>
        <dl>
          <dt>Model artifact</dt>
          <dd>${escapeHtml(manifestModel)}</dd>
          <dt>Numeric features</dt>
          <dd>${escapeHtml(preprocessing?.numericColumns?.join(", ") || "Waiting for schema")}</dd>
          <dt>Categorical features</dt>
          <dd>${escapeHtml(preprocessing?.categoricalColumns?.join(", ") || "Waiting for schema")}</dd>
          <dt>Input vector length</dt>
          <dd>${escapeHtml(preprocessing?.inputLength || "Derived from schema/model")}</dd>
        </dl>
      </div>
    `;
  }

  function renderDebug() {
    if (!state.debug) return "";
    return `
      <details class="debug-panel" open>
        <summary>Runtime diagnostics</summary>
        <pre>${escapeHtml(JSON.stringify(state.debug, null, 2))}</pre>
      </details>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  init();
}
