# Bitácora de prompts — Proyecto CCE

Registro del uso de IA: qué se pidió, qué respondió y qué corregimos.
Meta del profesor: corregir a la IA **al menos 3 veces**.

| # | Fecha | Prompt (resumen) | Resultado | ¿Corrección? |
|---|-------|------------------|-----------|--------------|
| 1 | 2026-11-16 | Leer la propuesta y sugerir cómo comenzar | Plan por pasos; stack HTML/CSS/JS | — |
| 2 | 2026-11-16 | ¿Usar PHP? | PHP como fase 2 (guardar 4 empresas); JS para cálculos y simulador | — |
| 3 | 2026-11-16 | Paso 0: estructura del proyecto | git init, index.html, styles.css, app.js | — |
| 4 | 2026-11-16 | Paso 1: formulario de captura | Form con empresa, ER, balance y supuestos; JS lee datos y los muestra en consola | — |
| 5 | 2026-11-16 | Paso 2: funciones de cálculo | Funciones puras PCI, PCC, PDP, CCE; verificadas con datos de ejemplo (CCE = 103.89 días) | — |
| 6 | 2026-11-16 | Paso 3: mostrar resultados | Tarjetas PCI/PCC/PDP/CCE y tabla de desarrollo con la fórmula sustituida | — |
| 7 | 2026-11-16 | Paso 5: simulador | 3 sliders (−días inventario, −días cobro, +días pago) con recálculo en vivo y tabla comparativa | — |
| 8 | 2026-11-16 | Modularizar en carpetas y archivos | css/ (4 archivos), js/logica (cálculos puros), js/ui (interfaz), docs/; ES modules; variables CSS | — |
| 9 | 2026-11-16 | Paso 6: efectivo liberado y ahorro financiero | Días ganados × base diaria por componente; ahorro = total × tasa. Ejemplo (−20, −10, +15): $1,150,684.93 liberados, $138,082.19 de ahorro | — |
| 10 | 2026-11-16 | Paso 7: mejorar UI con animaciones y transiciones | Encabezado con degradado; secciones y tarjetas con entrada escalonada; números que cuentan (requestAnimationFrame); scroll suave; hover y foco; respeta prefers-reduced-motion | — |
| 11 | 2026-11-16 | Paso 8: resultados en ventana modal en lugar de abajo del botón | <dialog> nativo con showModal(); cierra con ×, Esc o clic fuera; animación de entrada/salida; fondo desenfocado | — |
| 12 | 2026-11-16 | Paso 9: sector, interpretación y puntos extra | Sector editable por empresa; semáforos; interpretación automática; alertas de riesgo y de datos; alertas del escenario simulado; sensibilidad (tabla + gráfica); gráfica empresa vs sector. La IA detectó y corrigió en su propia revisión: eje X de sensibilidad no lineal y estilos de tabla heredados | — |
| 13 | 2026-11-16 | Los valores del sector serán entradas, no valores fijos | Se quitaron los promedios inventados por la IA; los campos del sector quedan vacíos y obligatorios; sector.js solo guarda el giro | ✅ **Corrección 1:** la IA había puesto promedios del sector "ilustrativos" sin fuente; el equipo decidió que deben capturarse con los datos del caso |
| 14 | 2026-11-16 | Paso 10: dejar todo el formulario en blanco | Se quitaron los datos de ejemplo; todos los campos vacíos y obligatorios con texto guía (placeholder); empresa sin selección inicial | — |
| 15 | 2026-11-16 | Agregar botón "Cargar ejemplo" | Botón junto a Calcular que llena el caso verificado (CCE = 103.89 días); datos en js/logica/ejemplo.js | — |

## Supuestos
- Días del año: **capturado en el formulario** (sugerido 365; `DIAS_ANIO` en `js/logica/config.js` es el valor por defecto de las funciones de cálculo)
- Ventas a crédito: capturadas como % de las ventas totales
- Compras = Costo de ventas + Inventario final − Inventario inicial
- PCI usa el **inventario final** (criterio Gitman). Alternativa: inventario promedio.
- Tasa de interés anual: capturada en el formulario
- Base diaria: inventario = Costo de ventas / días; cobranza = Ventas a crédito / días; proveedores = Compras / días
- Ahorro financiero anual = Efectivo liberado × tasa (costo de oportunidad del financiamiento)
- **Sector:** PCI, PCC y PDP del sector son **entradas obligatorias** del formulario (datos del caso). La app no trae valores por defecto.
- Semáforo: verde ≤10% peor que el sector, amarillo 10–30%, rojo >30%. CCE se mide contra el ciclo operativo del sector (PCI+PCC)
- Alertas: componente >1.5× el sector = riesgo; PDP <0.6× el sector = paga demasiado rápido; CCE >2× el sector = necesidad alta de financiamiento
