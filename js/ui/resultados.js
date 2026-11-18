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

// Los componentes no tienen dato del sector: se muestra cuánto vale cada día
function pintarBase(id, componente) {
  const el = document.getElementById(id);
  el.className = "semaforo nd";
  el.textContent = `1 día = ${formatoPesos(componente.base)}`;
}

export function mostrarResultados(datos, r, comparacion) {
  // 1. Mostrar la sección con animación de entrada
  revelar(document.getElementById("resultados"));

  // 2. Tarjetas: los números "cuentan" hasta su valor
  animarNumero(document.getElementById("res-pci"), r.pci, formatoDias);
  animarNumero(document.getElementById("res-pcc"), r.pcc, formatoDias);
  animarNumero(document.getElementById("res-pdp"), r.pdp, formatoDias);
  animarNumero(document.getElementById("res-cce"), r.cce, formatoDias, 900);

  // Componentes: valor de un día · CCE: semáforo contra el sector
  const [pci, pcc, pdp] = comparacion.componentes;
  pintarBase("sem-pci", pci);
  pintarBase("sem-pcc", pcc);
  pintarBase("sem-pdp", pdp);
  pintarSemaforo("sem-cce", comparacion.cce);

  // 3. Tabla de desarrollo: [concepto, fórmula con datos, resultado]
  const d = datos.dias;
  const n = formatoPesos;
  const filas = [
    ["Ventas a crédito",
     `${n(datos.ventas)} × ${datos.pctCredito}%`,
     n(r.ventasCredito)],
    ["Inventario promedio",
     `(${n(datos.invInicial)} + ${n(datos.invFinal)}) ÷ 2`,
     n(r.invPromedio)],
    ["Compras (dato del caso)",
     `Calculadas: ${n(datos.costoVentas)} + ${n(datos.invFinal)} − ${n(datos.invInicial)} = ${n(r.comprasCalculadas)}`,
     n(r.compras)],
    [`PCI (inventario ${datos.basePCI})`,
     `${n(r.inventarioPCI)} ÷ (${n(datos.costoVentas)} ÷ ${d})`,
     formatoDias(r.pci)],
    [`PCC (ventas ${datos.basePCC === "totales" ? "totales" : "a crédito"})`,
     `${n(datos.cxc)} ÷ (${n(r.ventasPCC)} ÷ ${d})`,
     formatoDias(r.pcc)],
    ["PDP",
     `${n(datos.cxp)} ÷ (${n(r.compras)} ÷ ${d})`,
     formatoDias(r.pdp)],
    ["CCE",
     `${formatoDias(r.pci)} + ${formatoDias(r.pcc)} − ${formatoDias(r.pdp)}`,
     formatoDias(r.cce)],
    ["Brecha vs sector",
     `${formatoDias(r.cce)} − ${formatoDias(datos.sectorCCE)}`,
     formatoDias(r.cce === null ? null : r.cce - datos.sectorCCE)],
  ];
  llenarTabla(document.getElementById("tabla-desarrollo"), filas);
}
