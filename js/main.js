// =====================================================================
//  PUNTO DE ENTRADA
//  Este archivo solo conecta las piezas; la lógica vive en los módulos.
//
//    Formulario ──► calcularTodo() ──► compararConSector()
//                        │
//                        ├─► abrirVentana()
//                        ├─► mostrarResultados()   (tarjetas + semáforos)
//                        ├─► mostrarDiagnostico()  (interpretación, alertas, gráfica)
//                        ├─► mostrarEstrategias()  (3 estrategias cuantificadas)
//                        ├─► iniciarSimulador()
//                        └─► mostrarSensibilidad() (tabla + gráfica)
// =====================================================================

import { calcularTodo } from "./logica/calculos.js";
import { compararConSector } from "./logica/diagnostico.js";
import { configurarFormulario, leerDatos, nombreEmpresa } from "./ui/formulario.js";
import { mostrarResultados } from "./ui/resultados.js";
import { mostrarDiagnostico } from "./ui/diagnostico.js";
import { configurarSimulador, iniciarSimulador } from "./ui/simulador.js";
import { mostrarSensibilidad } from "./ui/sensibilidad.js";
import { mostrarEstrategias } from "./ui/estrategias.js";
import { configurarVentana, abrirVentana } from "./ui/ventana.js";

configurarFormulario();
configurarSimulador();
configurarVentana();

document.getElementById("form-captura").addEventListener("submit", (evento) => {
  evento.preventDefault(); // evita que la página se recargue

  const datos = leerDatos();
  const resultados = calcularTodo(datos);
  const comparacion = compararConSector(datos, resultados);

  // Primero se abre la ventana: así las gráficas ya tienen tamaño al dibujarse
  abrirVentana(`Resultados · ${nombreEmpresa()}`);

  mostrarResultados(datos, resultados, comparacion);
  mostrarDiagnostico(datos, resultados, comparacion);
  mostrarEstrategias(datos, resultados);
  iniciarSimulador(datos, resultados);
  mostrarSensibilidad(datos, resultados);
});
