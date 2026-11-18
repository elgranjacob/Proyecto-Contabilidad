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
| 16 | 2026-11-18 | Adaptar la app al Caso A (Ferretera del Norte) con las instrucciones del profesor | Formulario solo del Caso A en millones; compras como dato (430); supuestos seleccionables (365/360, ventas crédito/totales, inventario promedio/final, tasa 14%); comparación solo contra el CCE del sector (95 días); sección de 3 estrategias cuantificadas con riesgos y botón para simularlas | — |

## Supuestos (Caso A: Ferretera del Norte)
- Cifras en **millones de pesos**.
- Días del año: **365** (seleccionable 360 en el formulario).
- PCC con **ventas a crédito** (600 × 60% = 360). Alternativa seleccionable: ventas totales.
- PCI con **inventario promedio** ((180 + 220) ÷ 2 = 200). Alternativa seleccionable: inventario final.
- Compras: se usa la **cifra del caso (430)**. Calculadas (CV + IF − II) darían 460; la app muestra la diferencia como alerta informativa.
- Tasa de financiamiento de corto plazo: **14%** para valorar el efectivo liberado. Ahorro anual = efectivo liberado × tasa.
- Base diaria: inventario = Costo de ventas / días; cobranza = ventas usadas en el PCC / días; proveedores = Compras / días.
- Sector: el caso solo da el **CCE promedio (95 días)**. El semáforo se aplica al CCE (verde ≤10% arriba, amarillo 10–30%, rojo >30%); los componentes se diagnostican por su peso en el ciclo.
- Alertas: CCE >1.5× el sector = necesidad alta de financiamiento; PCI >120 d, PCC >60 d, PDP >90 d = riesgo operativo; en el simulador, recortes de >40 d de inventario, >20 d de cobro o >30 d más de pago generan alerta.
- Estrategias (supuestos del equipo, en `js/logica/estrategias.js`): −30 d PCI, −15 d PCC, +25 d PDP = 70 días ≈ la brecha con el sector.

## Verificación manual (365 días · ventas a crédito · inventario promedio)
| Concepto | Cálculo | Resultado |
|---|---|---|
| PCI | 200 ÷ (420 ÷ 365) | 173.81 días |
| PCC | 50 ÷ (360 ÷ 365) | 50.69 días |
| PDP | 70 ÷ (430 ÷ 365) | 59.42 días |
| CCE | 173.81 + 50.69 − 59.42 | 165.09 días (brecha +70.09 vs 95) |

| Estrategia | Días | Efectivo liberado | Ahorro anual (14%) | CCE resultante |
|---|---|---|---|---|
| Inventario −30 d | 30 × 420/365 | $34.52 M | $4.83 M | 135.09 d |
| Cobranza −15 d | 15 × 360/365 | $14.79 M | $2.07 M | 150.09 d |
| Proveedores +25 d | 25 × 430/365 | $29.45 M | $4.12 M | 140.09 d |
| Las tres | 70 d | $78.77 M | $11.03 M | 95.09 d |
