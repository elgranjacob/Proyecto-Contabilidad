// =====================================================================
//  SIMULADOR: sliders "¿y si…?" que recalculan el CCE en vivo
// =====================================================================

import { simular, calcularEfectivoLiberado } from "../logica/calculos.js";
import { formatoDias, formatoCambio, formatoPesos } from "../logica/formato.js";
import { llenarTabla } from "./tabla.js";
import { animarNumero, revelar } from "./animaciones.js";
import { generarAlertas } from "../logica/diagnostico.js";
import { pintarAlertas } from "./alertas.js";

// Estado del módulo: los últimos datos y resultados calculados.
// "let" porque cambian cada vez que se presiona Calcular.
let datosActuales = null;
let resultadoActual = null;

// Referencias a los 3 sliders
const sliderPCI = document.getElementById("sim-pci");
const sliderPCC = document.getElementById("sim-pcc");
const sliderPDP = document.getElementById("sim-pdp");

// Se ejecuta cada vez que se mueve un slider
function actualizarSimulacion() {
  if (resultadoActual === null || resultadoActual.cce === null) return;

  const ajustes = {
    menosPCI: Number(sliderPCI.value),
    menosPCC: Number(sliderPCC.value),
    masPDP:   Number(sliderPDP.value),
  };

  // Mostrar el valor de cada slider junto a su etiqueta
  document.getElementById("sim-pci-valor").textContent = ajustes.menosPCI;
  document.getElementById("sim-pcc-valor").textContent = ajustes.menosPCC;
  document.getElementById("sim-pdp-valor").textContent = ajustes.masPDP;

  const sim = simular(resultadoActual, ajustes);

  // [nombre, actual, simulado, ¿subir es bueno?]
  // En PCI, PCC y CCE bajar es bueno; en PDP subir es bueno (el proveedor financia la operación).
  const componentes = [
    ["PCI", resultadoActual.pci, sim.pci, false],
    ["PCC", resultadoActual.pcc, sim.pcc, false],
    ["PDP", resultadoActual.pdp, sim.pdp, true],
    ["CCE", resultadoActual.cce, sim.cce, false],
  ];

  // Convertir a texto para la tabla
  const filas = componentes.map(([nombre, antes, despues]) =>
    [nombre, formatoDias(antes), formatoDias(despues), formatoCambio(despues - antes)]
  );
  const trs = llenarTabla(document.getElementById("tabla-simulacion"), filas);

  // Pintar la celda "Cambio" de verde (mejora) o rojo (empeora)
  componentes.forEach(([, antes, despues, subirEsBueno], i) => {
    const cambio = despues - antes;
    const esMejora = subirEsBueno ? cambio > 0 : cambio < 0;
    const esPeor   = subirEsBueno ? cambio < 0 : cambio > 0;
    if (esMejora) trs[i].lastChild.classList.add("mejora");
    if (esPeor)   trs[i].lastChild.classList.add("empeora");
  });

  mostrarImpactoFinanciero(sim);

  // Riesgos del escenario simulado (ej. alargar demasiado el pago a proveedores)
  pintarAlertas(
    document.getElementById("sim-alertas"),
    generarAlertas(sim, datosActuales.sector),
    "Sin riesgos detectados en este escenario."
  );
}

// Traduce los días ganados a pesos: efectivo liberado y ahorro financiero
function mostrarImpactoFinanciero(sim) {
  const ef = calcularEfectivoLiberado(datosActuales, resultadoActual, sim);

  // Tarjetas (animación corta: se actualizan mientras se arrastra el slider)
  animarNumero(document.getElementById("sim-efectivo"), ef.total, formatoPesos, 300);
  animarNumero(document.getElementById("sim-ahorro"), ef.ahorro, formatoPesos, 300);
  document.getElementById("sim-ahorro-desc").textContent =
    `Efectivo liberado × ${datosActuales.tasa}% anual`;

  // Tabla de detalle: [fuente, días ganados, base diaria, efectivo liberado]
  const fuentes = [
    ["Inventario (menos días)",   ef.inventario],
    ["Cobranza (menos días)",     ef.cobranza],
    ["Proveedores (más días)",    ef.proveedores],
  ];
  const filas = fuentes.map(([nombre, f]) =>
    [nombre, f.dias.toFixed(2), formatoPesos(f.base), formatoPesos(f.monto)]
  );
  filas.push(["Total", "", "", formatoPesos(ef.total)]);

  llenarTabla(document.getElementById("tabla-efectivo"), filas);
}

function reiniciarSimulacion() {
  sliderPCI.value = 0;
  sliderPCC.value = 0;
  sliderPDP.value = 0;
  actualizarSimulacion();
}

// Se llama UNA vez al cargar la página: registra los eventos
export function configurarSimulador() {
  // El evento "input" se dispara MIENTRAS se arrastra el slider (en vivo)
  sliderPCI.addEventListener("input", actualizarSimulacion);
  sliderPCC.addEventListener("input", actualizarSimulacion);
  sliderPDP.addEventListener("input", actualizarSimulacion);
  document.getElementById("sim-reiniciar").addEventListener("click", reiniciarSimulacion);
}

// Se llama cada vez que hay un resultado nuevo
export function iniciarSimulador(datos, resultado) {
  datosActuales = datos;
  resultadoActual = resultado;

  // No se puede reducir más días de los que hay
  sliderPCI.max = Math.floor(resultado.pci ?? 0);
  sliderPCC.max = Math.floor(resultado.pcc ?? 0);

  reiniciarSimulacion();
  revelar(document.getElementById("simulador"));
}
