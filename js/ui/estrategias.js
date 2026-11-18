// =====================================================================
//  ESTRATEGIAS (interfaz): tabla con días y pesos liberados por
//  estrategia, tarjetas con acción y riesgos, y botón "Simular"
//  que lleva cada estrategia al simulador.
// =====================================================================

import { ESTRATEGIAS, evaluarAjustes, ajustesCombinados } from "../logica/estrategias.js";
import { formatoDias, formatoPesos } from "../logica/formato.js";
import { aplicarAjustes } from "./simulador.js";
import { revelar } from "./animaciones.js";

// Crea una fila <tr> con celdas de texto y un botón al final
function fila(celdas, ajustes) {
  const tr = document.createElement("tr");
  for (const texto of celdas) {
    const td = document.createElement("td");
    td.textContent = texto;
    tr.appendChild(td);
  }
  const td = document.createElement("td");
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "secundario";
  boton.textContent = "Simular";
  boton.addEventListener("click", () => aplicarAjustes(ajustes));
  td.appendChild(boton);
  tr.appendChild(td);
  return tr;
}

export function mostrarEstrategias(datos, r) {
  const seccion = document.getElementById("estrategias");
  if (r.cce === null) {
    seccion.hidden = true;
    return;
  }
  revelar(seccion);

  // 1. Tabla resumen
  const tbody = document.getElementById("tabla-estrategias");
  tbody.innerHTML = "";

  for (const e of ESTRATEGIAS) {
    const ev = evaluarAjustes(datos, r, e.ajustes);
    tbody.appendChild(fila(
      [e.nombre, e.componente, ev.dias.toFixed(2), formatoPesos(ev.efectivo), formatoPesos(ev.ahorro), formatoDias(ev.cce)],
      e.ajustes
    ));
  }

  const combinados = ajustesCombinados();
  const total = evaluarAjustes(datos, r, combinados);
  const trTotal = fila(
    ["Las tres juntas", "Todos", total.dias.toFixed(2), formatoPesos(total.efectivo), formatoPesos(total.ahorro), formatoDias(total.cce)],
    combinados
  );
  trTotal.classList.add("combinada");
  tbody.appendChild(trTotal);

  // 2. Tarjetas con acción concreta y riesgos
  const caja = document.getElementById("detalle-estrategias");
  caja.innerHTML = "";
  ESTRATEGIAS.forEach((e, i) => {
    const art = document.createElement("article");
    art.className = "estrategia";

    const h3 = document.createElement("h3");
    h3.textContent = `${i + 1}. ${e.nombre}`;

    const accion = document.createElement("p");
    accion.textContent = e.accion;

    const riesgo = document.createElement("p");
    riesgo.className = "riesgo";
    riesgo.textContent = `Riesgos: ${e.riesgos}`;

    art.append(h3, accion, riesgo);
    caja.appendChild(art);
  });
}
