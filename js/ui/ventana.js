// =====================================================================
//  VENTANA MODAL: abre y cierra el <dialog> de resultados con animación
// =====================================================================

const ventana = document.getElementById("ventana-resultados");
const contenido = ventana.querySelector(".ventana-contenido");
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function abrirVentana(titulo) {
  document.getElementById("ventana-titulo").textContent = titulo;

  if (!ventana.open) ventana.showModal(); // showModal() = modal con fondo oscuro
  contenido.scrollTop = 0;                // empezar siempre arriba
}

// Cierre con animación: primero agregamos la clase "cerrando" (CSS anima la salida)
// y cuando la animación termina, cerramos de verdad con close().
function cerrarVentana() {
  if (reducirMovimiento) {
    ventana.close();
    return;
  }
  ventana.classList.add("cerrando");
  ventana.addEventListener("animationend", () => {
    ventana.classList.remove("cerrando");
    ventana.close();
  }, { once: true }); // { once: true } = el listener se borra solo después de usarse
}

// Se llama UNA vez al cargar la página: registra las 3 formas de cerrar
export function configurarVentana() {
  // 1. Botón ×
  document.getElementById("ventana-cerrar").addEventListener("click", cerrarVentana);

  // 2. Tecla Esc: el navegador dispara "cancel". Lo interceptamos para animar.
  ventana.addEventListener("cancel", (evento) => {
    evento.preventDefault();
    cerrarVentana();
  });

  // 3. Clic fuera de la ventana (en el fondo oscuro).
  //    El contenido llena todo el <dialog>, así que si el clic "cae" en el
  //    propio <dialog> (y no en un hijo), fue en el fondo.
  ventana.addEventListener("click", (evento) => {
    if (evento.target === ventana) cerrarVentana();
  });
}
