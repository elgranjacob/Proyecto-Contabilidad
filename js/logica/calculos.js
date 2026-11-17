// =====================================================================
//  CÁLCULOS DEL CCE
//  Funciones "puras": reciben números y devuelven números.
//  No saben que existe una página web, por eso se pueden probar solas.
// =====================================================================

import { DIAS_ANIO } from "./config.js";

// División segura: si el divisor es 0, devuelve null en lugar de Infinity
function dividir(a, b) {
  if (b === 0) return null;
  return a / b;
}

// Compras del periodo = Costo de ventas + Inventario final − Inventario inicial
export function calcularCompras(costoVentas, invInicial, invFinal) {
  return costoVentas + invFinal - invInicial;
}

// PCI: Periodo de conversión de inventario (días)
// PCI = Inventario / (Costo de ventas / días)
export function calcularPCI(inventario, costoVentas, dias = DIAS_ANIO) {
  return dividir(inventario, costoVentas / dias);
}

// PCC: Periodo de cobro de cuentas por cobrar (días)
// PCC = Cuentas por cobrar / (Ventas a crédito / días)
export function calcularPCC(cxc, ventasCredito, dias = DIAS_ANIO) {
  return dividir(cxc, ventasCredito / dias);
}

// PDP: Periodo de pago a proveedores (días)
// PDP = Cuentas por pagar / (Compras / días)
export function calcularPDP(cxp, compras, dias = DIAS_ANIO) {
  return dividir(cxp, compras / dias);
}

// CCE: Ciclo de conversión de efectivo (días)
// CCE = PCI + PCC − PDP
export function calcularCCE(pci, pcc, pdp) {
  if (pci === null || pcc === null || pdp === null) return null;
  return pci + pcc - pdp;
}

// Función "orquestadora": recibe todos los datos y devuelve todos los resultados
export function calcularTodo(datos) {
  const ventasCredito = datos.ventas * (datos.pctCredito / 100);
  const compras = calcularCompras(datos.costoVentas, datos.invInicial, datos.invFinal);

  const pci = calcularPCI(datos.invFinal, datos.costoVentas, datos.dias);
  const pcc = calcularPCC(datos.cxc, ventasCredito, datos.dias);
  const pdp = calcularPDP(datos.cxp, compras, datos.dias);
  const cce = calcularCCE(pci, pcc, pdp);

  return { ventasCredito, compras, pci, pcc, pdp, cce };
}

// BASES DIARIAS: cuánto dinero "atrapa" cada día de cada componente
//   Inventario  → Costo de ventas / días
//   Cobranza    → Ventas a crédito / días
//   Proveedores → Compras / días
export function basesDiarias(datos, r) {
  return {
    pci: datos.costoVentas / datos.dias,
    pcc: r.ventasCredito / datos.dias,
    pdp: r.compras / datos.dias,
  };
}

// SIMULADOR: aplica ajustes en días a los resultados actuales.
// ajustes = { menosPCI, menosPCC, masPDP } (todos en días, números positivos)
export function simular(actual, ajustes) {
  const pci = Math.max(0, actual.pci - ajustes.menosPCI); // Math.max evita días negativos
  const pcc = Math.max(0, actual.pcc - ajustes.menosPCC);
  const pdp = actual.pdp + ajustes.masPDP;
  const cce = calcularCCE(pci, pcc, pdp);
  return { pci, pcc, pdp, cce };
}

// EFECTIVO LIBERADO: convierte los días ganados en pesos.
// Ahorro financiero anual = Efectivo liberado × tasa de interés
export function calcularEfectivoLiberado(datos, actual, simulado) {
  const base = basesDiarias(datos, actual);

  // Días ganados (positivo = libera efectivo)
  const diasInventario  = actual.pci - simulado.pci;  // menos días en inventario
  const diasCobranza    = actual.pcc - simulado.pcc;  // menos días para cobrar
  const diasProveedores = simulado.pdp - actual.pdp;  // más días para pagar

  const porInventario  = diasInventario  * base.pci;
  const porCobranza    = diasCobranza    * base.pcc;
  const porProveedores = diasProveedores * base.pdp;

  const total  = porInventario + porCobranza + porProveedores;
  const ahorro = total * (datos.tasa / 100);

  return {
    inventario:  { dias: diasInventario,  base: base.pci, monto: porInventario },
    cobranza:    { dias: diasCobranza,    base: base.pcc, monto: porCobranza },
    proveedores: { dias: diasProveedores, base: base.pdp, monto: porProveedores },
    total,
    ahorro,
  };
}

// SENSIBILIDAD: efectivo liberado si cada componente mejora N días (uno a la vez).
// Devuelve una fila por cada paso: { dias, inventario, cobranza, proveedores }
export function calcularSensibilidad(datos, actual, pasos) {
  const liberado = (ajustes) =>
    calcularEfectivoLiberado(datos, actual, simular(actual, ajustes)).total;

  return pasos.map((dias) => ({
    dias,
    inventario:  liberado({ menosPCI: dias, menosPCC: 0,    masPDP: 0 }),
    cobranza:    liberado({ menosPCI: 0,    menosPCC: dias, masPDP: 0 }),
    proveedores: liberado({ menosPCI: 0,    menosPCC: 0,    masPDP: dias }),
  }));
}
