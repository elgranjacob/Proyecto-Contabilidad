// =====================================================================
//  FORMULARIO: lee los datos capturados por el usuario
// =====================================================================

import { GIROS } from "../logica/sector.js";
import { EJEMPLO } from "../logica/ejemplo.js";

// Atajo: lee un input por su id y lo convierte a número.
// (Lo que viene de un input siempre es texto: "100" + "50" daría "10050")
function leerNumero(id) {
  return Number(document.getElementById(id).value);
}

// Texto visible de la empresa elegida, ej. "A · Ferretera del Norte"
export function nombreEmpresa() {
  const select = document.getElementById("empresa");
  return select.options[select.selectedIndex].text;
}

// Muestra el giro de la empresa elegida (los valores del sector los captura el usuario)
function mostrarGiro() {
  const empresa = document.getElementById("empresa").value;
  document.getElementById("sector-giro").textContent = empresa
    ? `Giro: ${GIROS[empresa]}`
    : "Elige una empresa para ver su giro.";  // "" (sin elegir) cuenta como falso
}

// Llena el formulario con el caso de ejemplo.
// Object.entries convierte {ventas: 12000000, ...} en [["ventas", 12000000], ...]
// y como cada clave es igual al id de su campo, basta un ciclo.
function cargarEjemplo() {
  for (const [id, valor] of Object.entries(EJEMPLO)) {
    document.getElementById(id).value = valor;
  }
  mostrarGiro(); // cambiar .value desde JS no dispara "change", así que lo llamamos a mano
}

// Se llama UNA vez al cargar la página
export function configurarFormulario() {
  mostrarGiro();                                                     // empresa inicial
  document.getElementById("empresa").addEventListener("change", mostrarGiro); // al cambiar
  document.getElementById("cargar-ejemplo").addEventListener("click", cargarEjemplo);
}

// Devuelve un objeto con todos los datos del formulario
export function leerDatos() {
  return {
    empresa:     document.getElementById("empresa").value,
    ventas:      leerNumero("ventas"),
    pctCredito:  leerNumero("pctCredito"),
    costoVentas: leerNumero("costoVentas"),
    invInicial:  leerNumero("invInicial"),
    invFinal:    leerNumero("invFinal"),
    cxc:         leerNumero("cxc"),
    cxp:         leerNumero("cxp"),
    dias:        leerNumero("dias"),
    tasa:        leerNumero("tasa"),
    sector: {
      giro: GIROS[document.getElementById("empresa").value],
      pci:  leerNumero("sectorPci"),
      pcc:  leerNumero("sectorPcc"),
      pdp:  leerNumero("sectorPdp"),
    },
  };
}
