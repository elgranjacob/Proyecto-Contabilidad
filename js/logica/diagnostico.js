// =====================================================================
//  DIAGNÓSTICO: compara con el sector, asigna semáforos, interpreta
//  y genera alertas de riesgo. Son reglas de negocio (no tocan la página).
// =====================================================================

import { UMBRALES_SEMAFORO, FACTORES_ALERTA } from "./config.js";
import { basesDiarias } from "./calculos.js";
import { formatoDias, formatoPesos } from "./formato.js";

// Palancas típicas para mejorar cada componente (punto de partida para el informe)
const PALANCAS = {
  pci: "depurar inventario de lento movimiento, comprar en lotes más chicos y más frecuentes, mejorar el pronóstico de demanda.",
  pcc: "revisar la política de crédito, ofrecer descuento por pronto pago, dar seguimiento semanal a la cartera vencida, evaluar factoraje.",
  pdp: "negociar plazos más largos con proveedores y evaluar si el descuento por pronto pago realmente conviene frente a la tasa de interés.",
};

// Asigna color según qué tan peor que el sector está (desviación relativa)
function semaforo(desviacion) {
  if (desviacion === null) return "nd";
  if (desviacion <= UMBRALES_SEMAFORO.amarillo) return "verde";
  if (desviacion <= UMBRALES_SEMAFORO.rojo) return "amarillo";
  return "rojo";
}

// CCE del sector a partir de sus componentes
export function cceDelSector(sector) {
  return sector.pci + sector.pcc - sector.pdp;
}

// ---------------------------------------------------------------------
//  Comparación con el sector
//  Para cada componente calcula los "días desfavorables" (cuánto peor que
//  el sector) y cuánto dinero atrapan esos días.
// ---------------------------------------------------------------------
export function compararConSector(datos, r) {
  const s = datos.sector;
  const base = basesDiarias(datos, r);

  const componentes = [
    { clave: "pci", nombre: "Inventario",  valor: r.pci, ref: s.pci, subirEsBueno: false },
    { clave: "pcc", nombre: "Cobranza",    valor: r.pcc, ref: s.pcc, subirEsBueno: false },
    { clave: "pdp", nombre: "Proveedores", valor: r.pdp, ref: s.pdp, subirEsBueno: true },
  ].map((c) => {
    if (c.valor === null) {
      return { ...c, diasDesfavorables: 0, montoAtrapado: 0, semaforo: "nd" };
    }
    // En PCI y PCC es malo estar ARRIBA del sector; en PDP es malo estar ABAJO
    const diasDesfavorables = Math.max(0, c.subirEsBueno ? c.ref - c.valor : c.valor - c.ref);
    const desviacion = c.ref > 0 ? diasDesfavorables / c.ref : (diasDesfavorables > 0 ? Infinity : 0);
    return {
      ...c,
      diasDesfavorables,
      montoAtrapado: diasDesfavorables * base[c.clave],
      semaforo: semaforo(desviacion),
    };
  });

  // El CCE del sector puede ser cercano a 0 o negativo, así que la desviación se
  // mide contra el ciclo operativo del sector (PCI + PCC), que siempre es positivo.
  const refCCE = cceDelSector(s);
  let cce;
  if (r.cce === null) {
    cce = { valor: null, ref: refCCE, diasDesfavorables: 0, semaforo: "nd" };
  } else {
    const diasDesfavorables = Math.max(0, r.cce - refCCE);
    const escala = s.pci + s.pcc;
    cce = {
      valor: r.cce,
      ref: refCCE,
      diasDesfavorables,
      semaforo: semaforo(escala > 0 ? diasDesfavorables / escala : null),
    };
  }

  return { componentes, cce };
}

// ---------------------------------------------------------------------
//  Interpretación en lenguaje natural (arreglo de párrafos)
// ---------------------------------------------------------------------
export function generarInterpretacion(comparacion, datos) {
  const { componentes, cce } = comparacion;

  if (cce.valor === null) {
    return ["No se pudo calcular el CCE porque algún componente tiene un divisor en cero. Revisa las alertas de datos."];
  }

  const parrafos = [];

  // 1. Panorama general
  const diferencia = cce.valor - cce.ref;
  let general = `El efectivo queda atrapado ${formatoDias(cce.valor)} en la operación; el sector opera con ${formatoDias(cce.ref)}. `;
  general += diferencia > 0
    ? `Son ${formatoDias(diferencia)} más que el promedio del giro.`
    : `Está ${formatoDias(-diferencia)} por debajo del sector: mejor que el promedio.`;
  parrafos.push(general);

  if (cce.valor < 0) {
    parrafos.push("El CCE es negativo: la empresa cobra a sus clientes antes de pagar a sus proveedores, así que ellos financian la operación.");
  }

  // 2. Origen del problema: componentes desfavorables, del que más dinero atrapa al que menos
  const desfavorables = componentes
    .filter((c) => c.diasDesfavorables > 0)
    .sort((a, b) => b.montoAtrapado - a.montoAtrapado);

  if (desfavorables.length === 0) {
    parrafos.push("Los tres componentes están en línea o mejor que el sector. La prioridad es sostener ese desempeño.");
    return parrafos;
  }

  const principal = desfavorables[0];
  const dias = formatoDias(principal.diasDesfavorables);
  const descripcion = {
    pci: `el inventario: tarda ${dias} más que el sector en venderse`,
    pcc: `la cobranza: los clientes pagan ${dias} más tarde que en el sector`,
    pdp: `el pago a proveedores: la empresa paga ${dias} antes que el sector`,
  }[principal.clave];
  parrafos.push(`El principal origen del problema es ${descripcion}, lo que mantiene ${formatoPesos(principal.montoAtrapado)} de efectivo atrapado.`);

  if (desfavorables.length > 1) {
    const otros = desfavorables.slice(1)
      .map((c) => `${c.nombre.toLowerCase()} (${formatoPesos(c.montoAtrapado)})`)
      .join(" y ");
    parrafos.push(`También hay brecha en ${otros}.`);
  }

  // 3. Potencial si se iguala al sector
  const total = desfavorables.reduce((suma, c) => suma + c.montoAtrapado, 0);
  const ahorro = total * (datos.tasa / 100);
  parrafos.push(`Igualar al sector en esos componentes liberaría ${formatoPesos(total)}, con un ahorro financiero de ${formatoPesos(ahorro)} al año a una tasa de ${datos.tasa}%.`);

  // 4. Palancas para el componente principal
  parrafos.push(`Palancas a evaluar en ${principal.nombre.toLowerCase()}: ${PALANCAS[principal.clave]}`);

  return parrafos;
}

// ---------------------------------------------------------------------
//  Alertas de riesgo operativo
//  valores = { pci, pcc, pdp, cce } (actuales o simulados)
//  Cada alerta: { nivel: "critico" | "advertencia" | "info", titulo, mensaje }
// ---------------------------------------------------------------------
export function generarAlertas(valores, sector) {
  const alertas = [];
  const F = FACTORES_ALERTA;
  const refCCE = cceDelSector(sector);
  const { pci, pcc, pdp, cce } = valores;

  // OJO: en JS, null < 5 es true (null se convierte en 0). Por eso validamos !== null.
  if (cce !== null && refCCE > 0 && cce > 2 * refCCE) {
    alertas.push({ nivel: "critico", titulo: "Necesidad alta de financiamiento",
      mensaje: `El CCE (${formatoDias(cce)}) es más del doble del sector (${formatoDias(refCCE)}). La empresa debe financiar mucho más capital de trabajo que sus competidores.` });
  }
  if (pci !== null && pci > sector.pci * F.exceso) {
    alertas.push({ nivel: "advertencia", titulo: "Riesgo de obsolescencia y mermas",
      mensaje: `El inventario tarda ${formatoDias(pci)} en venderse (sector: ${formatoDias(sector.pci)}). La mercancía parada puede volverse obsoleta, dañarse o requerir descuentos.` });
  }
  if (pcc !== null && pcc > sector.pcc * F.exceso) {
    alertas.push({ nivel: "advertencia", titulo: "Riesgo de cuentas incobrables",
      mensaje: `Los clientes tardan ${formatoDias(pcc)} en pagar (sector: ${formatoDias(sector.pcc)}). Entre más vieja la cartera, menor la probabilidad de cobrarla.` });
  }
  if (pdp !== null && pdp > sector.pdp * F.exceso) {
    alertas.push({ nivel: "advertencia", titulo: "Riesgo con proveedores",
      mensaje: `Se paga a ${formatoDias(pdp)} (sector: ${formatoDias(sector.pdp)}). Puede dañar la relación, hacer perder descuentos por pronto pago o reducir la línea de crédito.` });
  }
  if (pdp !== null && pdp < sector.pdp * F.pagoRapido) {
    alertas.push({ nivel: "info", titulo: "Pago a proveedores demasiado rápido",
      mensaje: `Se paga a ${formatoDias(pdp)} cuando el sector paga a ${formatoDias(sector.pdp)}: la empresa está financiando a sus proveedores. Hay margen para negociar plazos.` });
  }
  if (cce !== null && cce < 0) {
    alertas.push({ nivel: "info", titulo: "CCE negativo",
      mensaje: "Los proveedores financian la operación. Es favorable, pero depende de conservar esa relación y esos plazos." });
  }
  return alertas;
}

// ---------------------------------------------------------------------
//  Alertas de calidad de datos (clave para detectar errores de captura)
// ---------------------------------------------------------------------
export function alertasDeDatos(datos, r) {
  const alertas = [];

  if (r.pci === null) {
    alertas.push({ nivel: "critico", titulo: "No se puede calcular el PCI",
      mensaje: "El costo de ventas es 0, así que no hay base diaria de inventario." });
  }
  if (r.pcc === null) {
    alertas.push({ nivel: "critico", titulo: "No se puede calcular el PCC",
      mensaje: "Las ventas a crédito son 0. Revisa las ventas y el % a crédito." });
  }
  if (r.compras <= 0) {
    alertas.push({ nivel: "critico", titulo: "Compras no positivas",
      mensaje: `Compras = Costo de ventas + Inv. final − Inv. inicial = ${formatoPesos(r.compras)}. Revisa el costo de ventas y los inventarios.` });
  }
  if (datos.costoVentas > datos.ventas) {
    alertas.push({ nivel: "advertencia", titulo: "Costo de ventas mayor que las ventas",
      mensaje: "El margen bruto sería negativo. Verifica que ambas cifras sean del mismo periodo y estén en las mismas unidades." });
  }
  if (r.pci !== null && r.pci > datos.dias) {
    alertas.push({ nivel: "advertencia", titulo: "Inventario mayor que un año de costo de ventas",
      mensaje: `El PCI (${formatoDias(r.pci)}) supera los días del año. Posible error de captura.` });
  }
  if (r.pcc !== null && r.pcc > datos.dias) {
    alertas.push({ nivel: "advertencia", titulo: "Cuentas por cobrar mayores que las ventas a crédito del año",
      mensaje: `El PCC (${formatoDias(r.pcc)}) supera los días del año. Revisa la cifra de CxC o el % de ventas a crédito.` });
  }
  if (r.pdp !== null && r.pdp > datos.dias) {
    alertas.push({ nivel: "advertencia", titulo: "Cuentas por pagar mayores que las compras del año",
      mensaje: `El PDP (${formatoDias(r.pdp)}) supera los días del año. Revisa la cifra de CxP o las compras.` });
  }
  return alertas;
}
