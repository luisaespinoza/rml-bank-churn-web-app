export function formatProbability(probability) {
  if (!Number.isFinite(probability)) return "Unavailable";
  return `${(probability * 100).toFixed(1)}%`;
}

export function getRiskBand(probability) {
  if (!Number.isFinite(probability)) {
    return {
      label: "Unavailable",
      className: "risk-unknown",
      summary: "The model could not produce a valid probability for this input."
    };
  }

  if (probability < 0.2) {
    return {
      label: "Lower estimated churn risk",
      className: "risk-low",
      summary: "The model estimates this customer profile as less likely to churn than many profiles in the demo setting."
    };
  }

  if (probability < 0.5) {
    return {
      label: "Moderate estimated churn risk",
      className: "risk-medium",
      summary: "The model estimates a non-trivial churn probability. This is useful for exploring model behavior, not for making customer decisions."
    };
  }

  return {
    label: "Higher estimated churn risk",
    className: "risk-high",
    summary: "The model estimates elevated churn probability for this profile. Treat this as a demo signal requiring validation, not as an operational decision."
  };
}

export function interpretChurnRisk(probability) {
  const band = getRiskBand(probability);
  return {
    probabilityText: formatProbability(probability),
    ...band,
    caveat:
      "This output is a local browser inference result from a compact ANN trained for a portfolio/educational project. It is not approved for production banking use."
  };
}
