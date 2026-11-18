// =====================================================================
//  ESTRATEGIAS DE REDUCCIÓN DEL CCE · Caso A: Ferretera del Norte
//  Tres estrategias, una por componente, cuantificadas en días y pesos.
//  Juntas suman 70 días, la brecha aproximada frente al sector (95 días).
//  Los días de cada estrategia son supuestos del equipo: se pueden ajustar aquí.
// =====================================================================

import { simular, calcularEfectivoLiberado } from "./calculos.js";

export const ESTRATEGIAS = [
  {
    id: "inventario",
    nombre: "Optimizar el inventario (clasificación ABC)",
    componente: "PCI",
    ajustes: { menosPCI: 30, menosPCC: 0, masPDP: 0 },
    accion: "Clasificar el catálogo en A/B/C, liquidar artículos de lento movimiento y comprar los artículos C en lotes más chicos y frecuentes. Mantener la compra por volumen solo en los artículos A de alta rotación.",
    riesgos: "Desabasto en artículos poco frecuentes; pérdida parcial del descuento por volumen; costo de liquidar mercancía con descuento.",
  },
  {
    id: "cobranza",
    nombre: "Acelerar la cobranza",
    componente: "PCC",
    ajustes: { menosPCI: 0, menosPCC: 15, masPDP: 0 },
    accion: "Ofrecer un descuento por pronto pago (p. ej. 1/10 neto 45), dar seguimiento semanal a la cartera vencida y revisar los límites de crédito de clientes morosos.",
    riesgos: "El descuento reduce el margen; condiciones más duras pueden ahuyentar a contratistas y clientes frecuentes hacia la competencia.",
  },
  {
    id: "proveedores",
    nombre: "Negociar plazos con proveedores",
    componente: "PDP",
    ajustes: { menosPCI: 0, menosPCC: 0, masPDP: 25 },
    accion: "Usar el poder de compra por volumen para pasar de ~60 a ~85 días de plazo, sin dejar de pagar a tiempo.",
    riesgos: "El proveedor puede subir precios o quitar el descuento por volumen; deterioro de la relación; si el descuento por pronto pago supera la tasa de financiamiento, no conviene alargar el pago.",
  },
];

// Evalúa un conjunto de ajustes: días ganados, efectivo liberado, ahorro y CCE resultante
export function evaluarAjustes(datos, actual, ajustes) {
  const sim = simular(actual, ajustes);
  const ef = calcularEfectivoLiberado(datos, actual, sim);
  return {
    dias: actual.cce - sim.cce,
    efectivo: ef.total,
    ahorro: ef.ahorro,
    cce: sim.cce,
  };
}

// Las tres estrategias aplicadas a la vez
export function ajustesCombinados() {
  return ESTRATEGIAS.reduce(
    (suma, e) => ({
      menosPCI: suma.menosPCI + e.ajustes.menosPCI,
      menosPCC: suma.menosPCC + e.ajustes.menosPCC,
      masPDP:   suma.masPDP   + e.ajustes.masPDP,
    }),
    { menosPCI: 0, menosPCC: 0, masPDP: 0 }
  );
}
