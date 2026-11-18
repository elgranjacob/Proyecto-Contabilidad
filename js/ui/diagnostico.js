// =====================================================================
//  DIAGNÓSTICO (interfaz): interpretación, alertas y gráfica vs sector
// =====================================================================

import { generarInterpretacion, generarAlertas, alertasDeDatos } from "../logica/diagnostico.js";
import { pintarAlertas } from "./alertas.js";
import { dibujarGrafica, COLORES } from "./graficas.js";
import { revelar } from "./animaciones.js";

export function mostrarDiagnostico(datos, r, comparacion) {
  revelar(document.getElementById("diagnostico"));

  document.getElementById("diag-giro").textContent =
    `Referencia: ferreterías (comercio minorista). CCE promedio del sector: ${datos.sectorCCE} días. ` +
    `Supuestos: ${datos.dias} días · PCC con ventas ${datos.basePCC === "totales" ? "totales" : "a crédito"} · ` +
    `PCI con inventario ${datos.basePCI} · tasa ${datos.tasa}%.`;

  // 1. Interpretación: un <p> por párrafo
  const caja = document.getElementById("diag-interpretacion");
  caja.innerHTML = "";
  for (const texto of generarInterpretacion(comparacion, datos)) {
    const p = document.createElement("p");
    p.textContent = texto;
    caja.appendChild(p);
  }

  // 2. Alertas: primero las de datos (errores de captura), luego las operativas
  pintarAlertas(
    document.getElementById("diag-alertas"),
    [...alertasDeDatos(datos, r), ...generarAlertas(r, datos)],
    "Sin alertas de riesgo."
  );

  // 3. Gráfica de barras agrupadas: empresa vs sector
  const { componentes, cce } = comparacion;
  dibujarGrafica(document.getElementById("grafica-sector"), {
    type: "bar",
    data: {
      labels: ["PCI", "PCC", "PDP", "CCE"],
      datasets: [
        {
          label: "Empresa",
          data: [...componentes.map((c) => c.valor), cce.valor],
          backgroundColor: COLORES.serie1,
          borderRadius: 4,
        },
        {
          label: "Sector",
          data: [null, null, null, cce.ref], // el caso solo da el CCE del sector
          backgroundColor: COLORES.serie2,
          borderRadius: 4,
        },
      ],
    },
    options: {
      datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.9 } }, // espacio entre barras
      plugins: {
        legend: { position: "top", align: "start", labels: { usePointStyle: true, pointStyle: "rectRounded" } },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.parsed.y === null ? null : ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} días`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { title: { display: true, text: "Días" } },
      },
    },
  });
}
