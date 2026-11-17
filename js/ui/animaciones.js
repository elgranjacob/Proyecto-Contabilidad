// =====================================================================
//  ANIMACIONES: utilidades para animar números y mostrar secciones
// =====================================================================

// ¿El usuario pidió "reducir movimiento" en su sistema? Entonces no animamos.
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Guardamos la animación en curso de cada elemento para poder cancelarla
// si llega un valor nuevo antes de que termine (ej. al arrastrar un slider).
const animacionesActivas = new Map();

// Curva de suavizado: arranca rápido y frena al final (se ve más natural)
function suavizar(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Anima el número de un elemento desde su valor actual hasta valorFinal.
//   elemento: el <p> o <td> donde se muestra
//   formato:  función que convierte el número en texto (formatoDias, formatoPesos…)
export function animarNumero(elemento, valorFinal, formato, duracion = 600) {
  cancelAnimationFrame(animacionesActivas.get(elemento));

  // Sin valor (N/D) o sin animaciones: mostrar directo
  if (valorFinal === null || reducirMovimiento) {
    elemento.textContent = formato(valorFinal);
    elemento.dataset.valor = valorFinal ?? "";
    return;
  }

  // Partimos del último valor mostrado (guardado en data-valor), o de 0
  const inicio = Number(elemento.dataset.valor) || 0;
  const t0 = performance.now();

  // requestAnimationFrame llama a "paso" en cada cuadro (~60 veces por segundo)
  function paso(ahora) {
    const progreso = Math.min((ahora - t0) / duracion, 1); // de 0 a 1
    const actual = inicio + (valorFinal - inicio) * suavizar(progreso);

    elemento.textContent = formato(actual);
    elemento.dataset.valor = actual;

    if (progreso < 1) {
      animacionesActivas.set(elemento, requestAnimationFrame(paso));
    } else {
      animacionesActivas.delete(elemento);
    }
  }
  animacionesActivas.set(elemento, requestAnimationFrame(paso));
}

// Muestra una sección con animación de entrada.
// Si ya estaba visible, reinicia la animación (para que se note el recálculo).
export function revelar(seccion) {
  seccion.hidden = false;
  seccion.classList.remove("aparecer");
  void seccion.offsetWidth; // truco: obliga al navegador a "olvidar" la animación anterior
  seccion.classList.add("aparecer");
}
