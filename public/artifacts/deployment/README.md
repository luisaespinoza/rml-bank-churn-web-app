# Deployment artifacts

Place the training-repo deployment outputs in this directory before running real browser inference.

Required:

- `best_model.onnx` - exported Tiny ANN ONNX model. This must be created from the trained `.pt` checkpoint; the browser app does not generate it.
- `preprocessing_schema.json` - fitted preprocessing metadata used to reproduce StandardScaler and OneHotEncoder feature construction in JavaScript.

Optional:

- `deployment_manifest.json` - metadata describing the selected model and export run.

The expected source files from the training repo are usually under:

- `artifacts/models/tiny.pt` or `artifacts/models/best_model.pt`
- `artifacts/deployment/preprocessing_schema.json`
- `artifacts/deployment/deployment_manifest.json`

Until `best_model.onnx` exists here, the app should show a setup issue instead of pretending inference is ready.
