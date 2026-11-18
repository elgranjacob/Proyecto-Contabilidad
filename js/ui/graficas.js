// =====================================================================
//  GRÁFICAS: envoltorio de Chart.js (se carga desde un CDN en index.html)
// =====================================================================

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Colores de las series (paleta validada para daltonismo, en orden fijo)
export const COLORES = {
  serie1: "#2a78d6", // azul
  serie2: "#eb6834", // naranja
  serie3: "#1baf7a", // aqua
};

// Cada <canvas> guarda su gráfica para poder destruirla antes de redibujar
// (si no, Chart.js encima una gráfica sobre otra).
const instancias = new Map();

// Ajustes globales: tipografía y colores neutros para ejes y textos
if (window.Chart) {
  Chart.defaults.font.family = "system-ui, sans-serif";
  Chart.defaults.color = "#52514e";
  Chart.defaults.borderColor = "#e4e8ea";
}

export function dibujarGrafica(canvas, config) {
  // Si no hay internet, el CDN no carga Chart.js: avisamos en lugar de romper la app
  if (!window.Chart) {
    // (después del primer aviso el canvas ya no está en la página: parentElement es null)
    if (canvas.parentElement) {
      canvas.parentElement.textContent = "No se pudo cargar la librería de gráficas (¿sin conexión a internet?). Los datos están en la tabla.";
    }
    return;
  }

  instancias.get(canvas)?.destroy(); // ?. = "solo si existe"

  const grafica = new Chart(canvas, {
    ...config,
    options: {
      responsive: true,
      maintainAspectRatio: false, // el alto lo controla el CSS (.grafica)
      animation: reducirMovimiento ? false : { duration: 700 },
      ...config.options,
    },
  });
  instancias.set(canvas, grafica);
}

// Formato corto para ejes (cifras en millones): 34.52 -> "$34.5 M"
export const pesosCorto = {
  format: (v) => `$${Number(v).toLocaleString("es-MX", { maximumFractionDigits: 1 })} M`,
};
