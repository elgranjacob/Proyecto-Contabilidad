// =====================================================================
//  FORMATO: convierte números en texto para mostrar en pantalla
//  Las cifras del caso están en MILLONES de pesos.
// =====================================================================

import { UNIDAD } from "./config.js";

// Días con 2 decimales. Si el valor es null (no calculable) muestra "N/D".
export function formatoDias(valor) {
  if (valor === null) return "N/D";
  return valor.toFixed(2) + " días";
}

// Millones de pesos: 34.5205 -> "$34.52 M"
export function formatoPesos(valor) {
  const texto = Math.abs(valor).toLocaleString("es-MX", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return `${valor < 0 ? "−" : ""}$${texto} ${UNIDAD}`;
}

// Cambio con signo: +5.00 / −3.00
export function formatoCambio(valor) {
  const signo = valor > 0 ? "+" : valor < 0 ? "−" : "";
  return signo + Math.abs(valor).toFixed(2);
}
