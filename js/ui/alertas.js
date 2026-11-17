// =====================================================================
//  ALERTAS: pinta una lista de alertas en un <ul>
//  Cada alerta lleva ícono + etiqueta + color (nunca solo color,
//  para que se entienda aunque alguien no distinga colores).
// =====================================================================

const ESTILO = {
  critico:     { icono: "✖", etiqueta: "Crítico" },
  advertencia: { icono: "▲", etiqueta: "Atención" },
  info:        { icono: "ℹ", etiqueta: "Información" },
};

export function pintarAlertas(ul, alertas, mensajeVacio = "Sin alertas.") {
  ul.innerHTML = "";

  if (alertas.length === 0) {
    const li = document.createElement("li");
    li.className = "alerta ok";
    li.textContent = `✓ ${mensajeVacio}`;
    ul.appendChild(li);
    return;
  }

  for (const alerta of alertas) {
    const { icono, etiqueta } = ESTILO[alerta.nivel];

    const li = document.createElement("li");
    li.className = `alerta ${alerta.nivel}`;

    const titulo = document.createElement("strong");
    titulo.textContent = `${icono} ${etiqueta}: ${alerta.titulo}`;

    const mensaje = document.createElement("p");
    mensaje.textContent = alerta.mensaje;

    li.append(titulo, mensaje);
    ul.appendChild(li);
  }
}
