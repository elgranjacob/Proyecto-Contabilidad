// =====================================================================
//  SUPUESTOS DEL MODELO
//  Valores por defecto. Todos están a la vista para la defensa oral.
// =====================================================================

// Días del año para convertir montos anuales en montos diarios
export const DIAS_ANIO = 365;

// Semáforos: qué tanto peor que el sector (en %) se considera amarillo o rojo.
//   Verde    → hasta 10% peor que el sector (o mejor)
//   Amarillo → entre 10% y 30% peor
//   Rojo     → más de 30% peor
export const UMBRALES_SEMAFORO = { amarillo: 0.10, rojo: 0.30 };

// Alertas de riesgo
//   exceso:      un componente 50% arriba del sector es una señal de riesgo
//   pagoRapido:  pagar en menos del 60% del plazo del sector = financiar al proveedor
export const FACTORES_ALERTA = { exceso: 1.5, pagoRapido: 0.6 };

// Análisis de sensibilidad: días de mejora a evaluar por componente
export const PASOS_SENSIBILIDAD = [5, 10, 15, 20, 30];
