// =====================================================================
//  FORMATO: convierte números en texto para mostrar en pantalla
// =====================================================================

// Días con 2 decimales. Si el valor es null (no calculable) muestra "N/D".
export function formatoDias(valor) {
  if (valor === null) return "N/D";
  return valor.toFixed(2) + " días";
}

// Pesos mexicanos con separador de miles: 1500000 -> "$1,500,000.00"
export function formatoPesos(valor) {
  return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

// Cambio con signo: +5.00 / −3.00
export function formatoCambio(valor) {
  const signo = valor > 0 ? "+" : valor < 0 ? "−" : "";
  return signo + Math.abs(valor).toFixed(2);
}
