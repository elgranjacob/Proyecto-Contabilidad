// =====================================================================
//  SENSIBILIDAD (interfaz): ¿cuánto efectivo libera cada componente
//  si mejora 5, 10, 15… días? Tabla + gráfica de líneas.
// =====================================================================

import { calcularSensibilidad } from "../logica/calculos.js";
import { PASOS_SENSIBILIDAD } from "../logica/config.js";
import { formatoPesos } from "../logica/formato.js";
import { llenarTabla } from "./tabla.js";
import { dibujarGrafica, COLORES, pesosCorto } from "./graficas.js";
import { revelar } from "./animaciones.js";

export function mostrarSensibilidad(datos, r) {
  const seccion = document.getElementById("sensibilidad");

  // Sin CCE (datos con errores) no tiene sentido el análisis
  if (r.cce === null) {
    seccion.hidden = true;
    return;
  }
  revelar(seccion);

  const filas = calcularSensibilidad(datos, r, PASOS_SENSIBILIDAD);

  // 1. Tabla
  llenarTabla(
    document.getElementById("tabla-sensibilidad"),
    filas.map((f) => [`${f.dias} días`, formatoPesos(f.inventario), formatoPesos(f.cobranza), formatoPesos(f.proveedores)])
  );

  // 2. Nota con un ejemplo concreto (fila de 10 días)
  const ejemplo = filas.find((f) => f.dias === 10) ?? filas[0];
  const tasa = datos.tasa / 100;
  document.getElementById("sens-nota").textContent =
    `Cada componente se mejora por separado. Ahorro anual = efectivo liberado × ${datos.tasa}%. ` +
    `Ejemplo: cobrar ${ejemplo.dias} días antes libera ${formatoPesos(ejemplo.cobranza)} ` +
    `y ahorra ${formatoPesos(ejemplo.cobranza * tasa)} al año. ` +
    `El inventario y la cobranza no pueden bajar de 0 días, por eso una línea puede aplanarse.`;

  // 3. Gráfica de líneas: una por componente
  // Puntos {x, y}: con un eje X lineal, 20→30 días ocupa el doble que 5→10
  const serie = (label, clave, color) => ({
    label,
    data: filas.map((f) => ({ x: f.dias, y: f[clave] })),
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBorderColor: "#fff", // anillo blanco alrededor del punto
    pointBorderWidth: 2,
  });

  dibujarGrafica(document.getElementById("grafica-sensibilidad"), {
    type: "line",
    data: {
      datasets: [
        serie("Inventario (−días)", "inventario", COLORES.serie1),
        serie("Cobranza (−días)", "cobranza", COLORES.serie2),
        serie("Proveedores (+días)", "proveedores", COLORES.serie3),
      ],
    },
    options: {
      interaction: { mode: "index", intersect: false }, // el tooltip muestra las 3 líneas a la vez
      plugins: {
        legend: { position: "top", align: "start", labels: { usePointStyle: true } },
        tooltip: {
          callbacks: {
            title: (items) => `Mejora de ${items[0].parsed.x} días`,
            label: (ctx) => ` ${ctx.dataset.label}: ${formatoPesos(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        // type "linear": la distancia entre puntos respeta los días reales
        x: {
          type: "linear",
          min: 0,
          title: { display: true, text: "Días de mejora" },
          grid: { display: false },
          ticks: { stepSize: 5 },
        },
        y: { title: { display: true, text: "Efectivo liberado" }, ticks: { callback: (v) => pesosCorto.format(v) } },
      },
    },
  });
}
