# Calculadora del Ciclo de Conversión de Efectivo (CCE)

Proyecto de Finanzas en las Organizaciones. Calcula el CCE de una empresa,
lo compara con su sector, simula estrategias para reducirlo y estima el
efectivo liberado y el ahorro financiero.

**CCE = PCI + PCC − PDP**

## Cómo ejecutarlo

```bash
php -S localhost:8000
```

Después abre http://localhost:8000 en el navegador.

> Hace falta un servidor (no basta con abrir el `index.html` con doble clic)
> porque los módulos de JavaScript (`import`/`export`) solo funcionan desde `http://`.
> Las gráficas usan Chart.js desde internet; sin conexión, la app funciona
> y muestra los datos en tablas.

## Qué hace

| Función | Dónde se ve |
|---|---|
| Captura de balance, estado de resultados, supuestos y sector | Formulario |
| PCI, PCC, PDP y CCE con desarrollo paso a paso | Ventana → Resultados |
| Semáforos contra el sector | Ventana → tarjetas |
| Interpretación automática y alertas de riesgo / de datos | Ventana → Diagnóstico |
| Gráfica empresa vs sector | Ventana → Diagnóstico |
| Simulador, efectivo liberado, ahorro y riesgos del escenario | Ventana → Simulador |
| Análisis de sensibilidad (tabla + gráfica) | Ventana → Sensibilidad |

## Estructura

```
├── index.html               Estructura de la página
├── css/
│   ├── base.css             Variables de color, botones, tablas
│   ├── formulario.css       Formulario de captura
│   ├── resultados.css       Tarjetas de resultados
│   ├── simulador.css        Sliders y tabla comparativa
│   ├── diagnostico.css      Semáforos, alertas, interpretación, gráficas
│   ├── ventana.css          Ventana modal de resultados
│   └── animaciones.css      Animaciones, transiciones y accesibilidad
├── js/
│   ├── main.js              Punto de entrada: conecta las piezas
│   ├── logica/              Funciones puras (no tocan la página)
│   │   ├── config.js        Supuestos: días, umbrales, factores de alerta
│   │   ├── sector.js        Giro de cada empresa (los promedios del sector son entradas)
│   │   ├── ejemplo.js       Caso de ejemplo para demo y verificación a mano
│   │   ├── calculos.js      PCI, PCC, PDP, CCE, simulación, sensibilidad
│   │   ├── diagnostico.js   Semáforos, interpretación y alertas
│   │   └── formato.js       Números → texto ($, días)
│   └── ui/                  Todo lo que lee o pinta la página
│       ├── formulario.js    Lee los datos y llena el sector
│       ├── resultados.js    Tarjetas, semáforos y tabla de desarrollo
│       ├── diagnostico.js   Interpretación, alertas y gráfica vs sector
│       ├── simulador.js     Sliders "¿y si…?" y riesgos del escenario
│       ├── sensibilidad.js  Tabla y gráfica de sensibilidad
│       ├── graficas.js      Envoltorio de Chart.js
│       ├── alertas.js       Pinta listas de alertas
│       ├── tabla.js         Utilidad para llenar tablas
│       ├── animaciones.js   Números que cuentan, entrada de secciones
│       └── ventana.js       Abre/cierra la ventana modal
└── docs/
    └── BITACORA.md          Bitácora de prompts y supuestos
```

## Flujo de la aplicación

```
Formulario ──► leerDatos() ──► calcularTodo() ──► compararConSector()
                                    │
                                    ├─► abrirVentana()
                                    ├─► mostrarResultados()
                                    ├─► mostrarDiagnostico()
                                    ├─► iniciarSimulador()
                                    └─► mostrarSensibilidad()
```

## Regla de diseño

- **`logica/`** son funciones puras: reciben datos y devuelven resultados, sin tocar la página.
- **`ui/`** solo lee y pinta la página: no hace cuentas financieras.

Así los cálculos se pueden verificar por separado y la interfaz se puede
cambiar sin romper las fórmulas.
