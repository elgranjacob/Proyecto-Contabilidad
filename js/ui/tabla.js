// =====================================================================
//  TABLAS: utilidad compartida para llenar un <tbody>
//  La usan resultados.js y simulador.js (así no repetimos código).
// =====================================================================

// filas = arreglo de arreglos de texto, por ejemplo:
//   [["PCI", "95.60 días"], ["PCC", "45.63 días"]]
// Devuelve las filas <tr> creadas, por si se quieren modificar después.
export function llenarTabla(tbody, filas) {
  tbody.innerHTML = ""; // vaciar la tabla

  const trs = [];
  for (const fila of filas) {
    const tr = document.createElement("tr");
    for (const texto of fila) {
      const td = document.createElement("td");
      td.textContent = texto;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    trs.push(tr);
  }
  return trs;
}
