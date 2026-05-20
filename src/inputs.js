import { DEFAULT_INPUTS, FALLBACK_CATEGORIES } from "./constants.js";

export const INPUT_FIELDS = [
  {
    name: "CreditScore",
    label: "Credit score",
    type: "number",
    min: 300,
    max: 900,
    step: 1,
    help: "Customer credit score."
  },
  {
    name: "Geography",
    label: "Geography",
    type: "select",
    options: FALLBACK_CATEGORIES.Geography,
    help: "Country associated with the account."
  },
  {
    name: "Gender",
    label: "Gender",
    type: "select",
    options: FALLBACK_CATEGORIES.Gender,
    help: "Category present in the training dataset."
  },
  {
    name: "Age",
    label: "Age",
    type: "number",
    min: 18,
    max: 100,
    step: 1,
    help: "Customer age in years."
  },
  {
    name: "Tenure",
    label: "Tenure",
    type: "number",
    min: 0,
    max: 10,
    step: 1,
    help: "Number of years as a customer."
  },
  {
    name: "Balance",
    label: "Balance",
    type: "number",
    min: 0,
    max: 300000,
    step: 100,
    help: "Account balance."
  },
  {
    name: "NumOfProducts",
    label: "Number of products",
    type: "number",
    min: 1,
    max: 4,
    step: 1,
    help: "Number of bank products used by the customer."
  },
  {
    name: "HasCrCard",
    label: "Has credit card",
    type: "select",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" }
    ],
    help: "Whether the customer has a credit card."
  },
  {
    name: "IsActiveMember",
    label: "Active member",
    type: "select",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" }
    ],
    help: "Whether the customer is marked as active."
  },
  {
    name: "EstimatedSalary",
    label: "Estimated salary",
    type: "number",
    min: 0,
    max: 250000,
    step: 100,
    help: "Estimated annual salary."
  }
];

export function coerceFormValue(field, rawValue) {
  if (field.type === "number") {
    const value = Number(rawValue);
    return Number.isFinite(value) ? value : DEFAULT_INPUTS[field.name];
  }

  if (field.name === "HasCrCard" || field.name === "IsActiveMember") {
    return Number(rawValue);
  }

  return rawValue;
}

export function getInitialInputs() {
  return { ...DEFAULT_INPUTS };
}
