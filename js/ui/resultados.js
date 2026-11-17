// =====================================================================
//  RESULTADOS: pinta las tarjetas y la tabla de desarrollo
// =====================================================================

import { formatoDias, formatoPesos } from "../logica/formato.js";
import { llenarTabla } from "./tabla.js";
import { animarNumero, revelar } from "./animaciones.js";

// Semáforo: ícono + etiqueta + color (nunca solo color)
const SEMAFORO = {
  verde:    { icono: "●", etiqueta: "En línea" },
  amarillo: { icono: "▲", etiqueta: "Atención" },
  rojo:     { icono: "✖", etiqueta: "Crítico" },
  nd:       { icono: "–", etiqueta: "N/D" },
};

function pintarSemaforo(id, evaluacion) {
  const el = document.getElementById(id);
  const { icono, etiqueta } = SEMAFORO[evaluacion.semaforo];
  el.className = `semaforo ${evaluacion.semaforo}`;
  el.textContent = `${icono} ${etiqueta} · sector ${evaluacion.ref.toFixed(0)} d`;
}

export function mostrarResultados(datos, r, comparacion) {
  // 1. Mostrar la sección con animación de entrada
  revelar(document.getElementById("resultados"));

  // 2. Tarjetas: los números "cuentan" hasta su valor
  animarNumero(document.getElementById("res-pci"), r.pci, formatoDias);
  animarNumero(document.getElementById("res-pcc"), r.pcc, formatoDias);
  animarNumero(document.getElementById("res-pdp"), r.pdp, formatoDias);
  animarNumero(document.getElementById("res-cce"), r.cce, formatoDias, 900);

  // Semáforos contra el sector
  const [pci, pcc, pdp] = comparacion.componentes;
  pintarSemaforo("sem-pci", pci);
  pintarSemaforo("sem-pcc", pcc);
  pintarSemaforo("sem-pdp", pdp);
  pintarSemaforo("sem-cce", comparacion.cce);

  // 3. Tabla de desarrollo: [concepto, fórmula con datos, resultado]
  const d = datos.dias;
  const filas = [
    ["Ventas a crédito",
     `${formatoPesos(datos.ventas)} × ${datos.pctCredito}%`,
     formatoPesos(r.ventasCredito)],
    ["Compras",
     `${formatoPesos(datos.costoVentas)} + ${formatoPesos(datos.invFinal)} − ${formatoPesos(datos.invInicial)}`,
     formatoPesos(r.compras)],
    ["PCI",
     `${formatoPesos(datos.invFinal)} ÷ (${formatoPesos(datos.costoVentas)} ÷ ${d})`,
     formatoDias(r.pci)],
    ["PCC",
     `${formatoPesos(datos.cxc)} ÷ (${formatoPesos(r.ventasCredito)} ÷ ${d})`,
     formatoDias(r.pcc)],
    ["PDP",
     `${formatoPesos(datos.cxp)} ÷ (${formatoPesos(r.compras)} ÷ ${d})`,
     formatoDias(r.pdp)],
    ["CCE",
     `${formatoDias(r.pci)} + ${formatoDias(r.pcc)} − ${formatoDias(r.pdp)}`,
     formatoDias(r.cce)],
  ];
  llenarTabla(document.getElementById("tabla-desarrollo"), filas);
}
