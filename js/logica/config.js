// =====================================================================
//  SUPUESTOS DEL MODELO · Caso A: Ferretera del Norte
//  Valores por defecto. Todos están a la vista para la defensa oral.
//  Los supuestos que pide el caso (días, ventas en PCC, inventario en PCI
//  y tasa) se eligen en el formulario; aquí solo van las reglas de la app.
// =====================================================================

// Días del año por defecto (el formulario permite 365 o 360)
export const DIAS_ANIO = 365;

// Unidad de las cifras del caso: millones de pesos
export const UNIDAD = "M";

// Semáforo del CCE frente al sector: qué tanto peor (en %) es amarillo o rojo.
//   Verde    → hasta 10% arriba del sector (o mejor)
//   Amarillo → entre 10% y 30% arriba
//   Rojo     → más de 30% arriba
export const UMBRALES_SEMAFORO = { amarillo: 0.10, rojo: 0.30 };

// Alertas de riesgo (el caso solo da el CCE del sector, así que los
// componentes se evalúan contra límites operativos razonables para el giro)
export const LIMITES_ALERTA = {
  pciAlto: 120,   // inventario de más de 4 meses: riesgo de obsolescencia
  pccAlto: 60,    // cartera de más de 2 meses: riesgo de incobrables
  pdpAlto: 90,    // pagar a más de 3 meses: riesgo con proveedores
};

// Riesgos de un escenario simulado: cambios grandes respecto a la situación actual
export const LIMITES_ESCENARIO = {
  menosPCI: 40,   // recortar más de 40 días de inventario: riesgo de desabasto
  menosPCC: 20,   // recortar más de 20 días de cobro: riesgo de perder clientes
  masPDP:   30,   // alargar más de 30 días el pago: riesgo de perder descuentos por volumen
};

// Análisis de sensibilidad: días de mejora a evaluar por componente
export const PASOS_SENSIBILIDAD = [5, 10, 15, 20, 30];
