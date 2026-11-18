// =====================================================================
//  FORMULARIO: lee los datos capturados por el usuario (Caso A)
// =====================================================================

import { CASO_A } from "../logica/ejemplo.js";

// Atajo: lee un input por su id y lo convierte a número.
// (Lo que viene de un input siempre es texto: "100" + "50" daría "10050")
function leerNumero(id) {
  return Number(document.getElementById(id).value);
}

function leerTexto(id) {
  return document.getElementById(id).value;
}

export function nombreEmpresa() {
  return "Ferretera del Norte";
}

// Llena el formulario con los datos del caso.
// Object.entries convierte {ventas: 600, ...} en [["ventas", 600], ...]
// y como cada clave es igual al id de su campo, basta un ciclo.
function cargarCaso() {
  for (const [id, valor] of Object.entries(CASO_A)) {
    document.getElementById(id).value = valor;
  }
}

// Se llama UNA vez al cargar la página
export function configurarFormulario() {
  document.getElementById("cargar-ejemplo").addEventListener("click", cargarCaso);
}

// Devuelve un objeto con todos los datos del formulario
export function leerDatos() {
  return {
    ventas:      leerNumero("ventas"),
    pctCredito:  leerNumero("pctCredito"),
    costoVentas: leerNumero("costoVentas"),
    compras:     leerNumero("compras"),
    invInicial:  leerNumero("invInicial"),
    invFinal:    leerNumero("invFinal"),
    cxc:         leerNumero("cxc"),
    cxp:         leerNumero("cxp"),
    dias:        leerNumero("dias"),
    basePCC:     leerTexto("basePCC"),   // "credito" | "totales"
    basePCI:     leerTexto("basePCI"),   // "promedio" | "final"
    tasa:        leerNumero("tasa"),
    sectorCCE:   leerNumero("sectorCCE"),
  };
}
