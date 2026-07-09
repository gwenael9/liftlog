export type UnitSystem = "kg" | "lbs";

const KG_TO_LBS = 2.20462;

// Arrondi à 1 décimale — évite les flottants du type 176.36999999999998.
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Arrondi à 2 décimales — le backend rejette weight_kg avec plus de 2 décimales.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function kgToDisplay(kg: number, unit: UnitSystem): number {
  return unit === "lbs" ? round1(kg * KG_TO_LBS) : round1(kg);
}

export function displayToKg(value: number, unit: UnitSystem): number {
  return unit === "lbs" ? round2(value / KG_TO_LBS) : round2(value);
}

// Convertit une valeur de poids stockée en kg (string de formulaire) vers
// l'unité affichée, en préservant les champs vides.
export function weightKgToDisplayString(kgStr: string, unit: UnitSystem): string {
  if (kgStr === "") return "";
  const n = Number(kgStr);
  if (Number.isNaN(n)) return kgStr;
  return String(kgToDisplay(n, unit));
}

// Convertit une saisie utilisateur (dans l'unité affichée) vers un string kg,
// pour rester compatible avec le stockage interne (toujours kg).
export function displayStringToWeightKg(valueStr: string, unit: UnitSystem): string {
  if (valueStr === "") return "";
  const n = Number(valueStr);
  if (Number.isNaN(n)) return valueStr;
  return String(displayToKg(n, unit));
}

export function formatWeight(kg: number, unit: UnitSystem): string {
  return `${kgToDisplay(kg, unit)} ${unit}`;
}
