// =====================================================================
//  DIAGNÓSTICO: compara con el sector, asigna semáforo, interpreta
//  y genera alertas de riesgo. Son reglas de negocio (no tocan la página).
//
//  El Caso A solo da el CCE promedio del sector (95 días), no sus
//  componentes. Por eso:
//    · el semáforo se aplica al CCE;
//    · cada componente se diagnostica por su peso en el ciclo y por el
//      dinero que tiene invertido (días × base diaria).
// =====================================================================

import { UMBRALES_SEMAFORO, LIMITES_ALERTA, LIMITES_ESCENARIO } from "./config.js";
import { basesDiarias } from "./calculos.js";
import { formatoDias, formatoPesos } from "./formato.js";

// Palancas típicas para mejorar cada componente (punto de partida para el informe)
const PALANCAS = {
  pci: "clasificación ABC del catálogo, depurar artículos de lento movimiento, comprar los artículos C en lotes más chicos aunque se pierda algo de descuento por volumen.",
  pcc: "descuento por pronto pago, seguimiento semanal de la cartera vencida, endurecer el crédito a clientes morosos, evaluar factoraje.",
  pdp: "usar el poder de compra por volumen para negociar plazos más largos, y comparar el descuento por pronto pago contra la tasa de financiamiento.",
};

// Asigna color según qué tan arriba del sector está (desviación relativa)
function semaforo(desviacion) {
  if (desviacion === null) return "nd";
  if (desviacion <= UMBRALES_SEMAFORO.amarillo) return "verde";
  if (desviacion <= UMBRALES_SEMAFORO.rojo) return "amarillo";
  return "rojo";
}

// ---------------------------------------------------------------------
//  Comparación con el sector
// ---------------------------------------------------------------------
export function compararConSector(datos, r) {
  const ref = datos.sectorCCE;
  const base = basesDiarias(datos, r);

  // Dinero invertido en cada componente = días × base diaria
  const componentes = [
    { clave: "pci", nombre: "Inventario",  valor: r.pci, base: base.pci },
    { clave: "pcc", nombre: "Cobranza",    valor: r.pcc, base: base.pcc },
    { clave: "pdp", nombre: "Proveedores", valor: r.pdp, base: base.pdp },
  ].map((c) => ({ ...c, monto: c.valor === null ? 0 : c.valor * c.base }));

  let cce;
  if (r.cce === null) {
    cce = { valor: null, ref, brecha: 0, semaforo: "nd" };
  } else {
    const brecha = r.cce - ref; // positiva = peor que el sector
    cce = {
      valor: r.cce,
      ref,
      brecha,
      semaforo: semaforo(ref > 0 ? Math.max(0, brecha) / ref : null),
    };
  }

  return { componentes, cce, base };
}

// ---------------------------------------------------------------------
//  Interpretación en lenguaje natural (arreglo de párrafos)
// ---------------------------------------------------------------------
export function generarInterpretacion(comparacion, datos) {
  const { componentes, cce, base } = comparacion;

  if (cce.valor === null) {
    return ["No se pudo calcular el CCE porque algún componente tiene un divisor en cero. Revisa las alertas de datos."];
  }

  const [inv, cob, prov] = componentes;
  const parrafos = [];
  const tasa = datos.tasa / 100;

  // 1. Panorama general
  let general = `El efectivo de Ferretera del Norte tarda ${formatoDias(cce.valor)} en regresar a caja; el sector lo hace en ${formatoDias(cce.ref)}. `;
  general += cce.brecha > 0
    ? `Son ${formatoDias(cce.brecha)} más que el promedio del giro (${((cce.brecha / cce.ref) * 100).toFixed(1)}% arriba).`
    : `Está ${formatoDias(-cce.brecha)} por debajo del sector: mejor que el promedio.`;
  parrafos.push(general);

  // 2. Componente dominante: el ciclo operativo es PCI + PCC
  const cicloOperativo = inv.valor + cob.valor;
  const pesoInv = (inv.valor / cicloOperativo) * 100;
  parrafos.push(
    `Inventario (PCI ${formatoDias(inv.valor)}): es el componente dominante, ${pesoInv.toFixed(1)}% del ciclo operativo. ` +
    `La mercancía tarda casi ${(inv.valor / 30).toFixed(1)} meses en venderse y mantiene ${formatoPesos(inv.monto)} invertidos. ` +
    `Es coherente con la estrategia de comprar en grandes volúmenes y con un catálogo muy amplio: el descuento por volumen se paga con días de inventario.`
  );

  // 3. Cobranza
  const textoBase = datos.basePCC === "totales" ? "ventas totales" : `ventas a crédito (${datos.pctCredito}% del total)`;
  parrafos.push(
    `Cobranza (PCC ${formatoDias(cob.valor)}, calculado con ${textoBase}): los clientes a crédito pagan en poco más de ${(cob.valor / 30).toFixed(1)} meses; ` +
    `la cartera de ${formatoPesos(datos.cxc)} es el segundo uso de efectivo.`
  );

  // 4. Proveedores
  const hueco = inv.valor - prov.valor;
  parrafos.push(
    `Proveedores (PDP ${formatoDias(prov.valor)}): los proveedores financian ${formatoPesos(datos.cxp)}, pero se les paga ` +
    (hueco > 0
      ? `${formatoDias(hueco)} antes de que la mercancía siquiera se venda. Comprando en volumen, la empresa debería tener poder de negociación para plazos más largos.`
      : `después de que la mercancía se vende: buena posición frente a proveedores.`)
  );

  // 5. Valor de cerrar la brecha
  if (cce.brecha > 0) {
    const bases = [base.pci, base.pcc, base.pdp];
    const min = Math.min(...bases) * cce.brecha;
    const max = Math.max(...bases) * cce.brecha;
    parrafos.push(
      `Cerrar la brecha de ${formatoDias(cce.brecha)} liberaría entre ${formatoPesos(min)} y ${formatoPesos(max)} según el componente que se mejore, ` +
      `con un ahorro financiero de ${formatoPesos(min * tasa)} a ${formatoPesos(max * tasa)} al año a una tasa de ${datos.tasa}%. ` +
      `Cada día de CCE vale entre ${formatoPesos(Math.min(...bases))} y ${formatoPesos(Math.max(...bases))}.`
    );
  }

  // 6. Palancas para el componente con más dinero invertido (inventario o cobranza)
  const principal = inv.monto >= cob.monto ? inv : cob;
  parrafos.push(`Palancas prioritarias en ${principal.nombre.toLowerCase()}: ${PALANCAS[principal.clave]} En proveedores: ${PALANCAS.pdp}`);

  return parrafos;
}

// ---------------------------------------------------------------------
//  Alertas de riesgo operativo
//  valores = { pci, pcc, pdp, cce } (actuales o simulados)
//  actual  = resultados actuales (solo en el simulador, para medir cambios)
//  Cada alerta: { nivel: "critico" | "advertencia" | "info", titulo, mensaje }
// ---------------------------------------------------------------------
export function generarAlertas(valores, datos, actual = null) {
  const alertas = [];
  const L = LIMITES_ALERTA;
  const ref = datos.sectorCCE;
  const { pci, pcc, pdp, cce } = valores;

  // OJO: en JS, null < 5 es true (null se convierte en 0). Por eso validamos !== null.
  if (cce !== null && ref > 0 && cce > 1.5 * ref) {
    alertas.push({ nivel: "critico", titulo: "Necesidad alta de financiamiento",
      mensaje: `El CCE (${formatoDias(cce)}) es ${(cce / ref).toFixed(2)} veces el del sector (${formatoDias(ref)}). La empresa financia mucho más capital de trabajo que sus competidores, a un costo de ${datos.tasa}% anual.` });
  } else if (cce !== null && cce > ref * (1 + UMBRALES_SEMAFORO.amarillo)) {
    alertas.push({ nivel: "advertencia", titulo: "CCE arriba del sector",
      mensaje: `El CCE (${formatoDias(cce)}) sigue ${formatoDias(cce - ref)} arriba del sector.` });
  } else if (cce !== null && actual !== null) {
    // Dentro del margen verde del semáforo (hasta 10% arriba) o mejor
    alertas.push({ nivel: "info", titulo: "Escenario en línea con el sector",
      mensaje: `El CCE simulado (${formatoDias(cce)}) queda en línea con el promedio del sector (${formatoDias(ref)}).` });
  }

  if (pci !== null && pci > L.pciAlto) {
    alertas.push({ nivel: "advertencia", titulo: "Riesgo de obsolescencia y mermas",
      mensaje: `El inventario tarda ${formatoDias(pci)} en venderse. Con un catálogo amplio, los artículos de lento movimiento pueden volverse obsoletos, dañarse o requerir descuentos.` });
  }
  if (pcc !== null && pcc > L.pccAlto) {
    alertas.push({ nivel: "advertencia", titulo: "Riesgo de cuentas incobrables",
      mensaje: `Los clientes tardan ${formatoDias(pcc)} en pagar. Entre más vieja la cartera, menor la probabilidad de cobrarla.` });
  }
  if (pdp !== null && pdp > L.pdpAlto) {
    alertas.push({ nivel: "advertencia", titulo: "Riesgo con proveedores",
      mensaje: `Pagar a ${formatoDias(pdp)} puede dañar la relación, encarecer las compras o hacer perder descuentos por volumen y pronto pago.` });
  }
  if (pci !== null && pdp !== null && pdp < pci / 2) {
    alertas.push({ nivel: "info", titulo: "Se paga mucho antes de vender",
      mensaje: `El plazo de proveedores (${formatoDias(pdp)}) cubre menos de la mitad del tiempo en inventario (${formatoDias(pci)}). La empresa financia con recursos propios ${formatoDias(pci - pdp)} de mercancía.` });
  }
  if (cce !== null && cce < 0) {
    alertas.push({ nivel: "info", titulo: "CCE negativo",
      mensaje: "Los proveedores financian la operación. Es favorable, pero depende de conservar esa relación y esos plazos." });
  }

  // Riesgos propios del escenario: cambios grandes respecto a la situación actual
  if (actual !== null) {
    const E = LIMITES_ESCENARIO;
    if (actual.pci - pci > E.menosPCI) {
      alertas.push({ nivel: "advertencia", titulo: "Riesgo de desabasto",
        mensaje: `Recortar ${(actual.pci - pci).toFixed(0)} días de inventario exige comprar en lotes más chicos: puede haber faltantes en un catálogo amplio y se pierde parte del descuento por volumen.` });
    }
    if (actual.pcc - pcc > E.menosPCC) {
      alertas.push({ nivel: "advertencia", titulo: "Riesgo de perder clientes",
        mensaje: `Cobrar ${(actual.pcc - pcc).toFixed(0)} días antes implica condiciones de crédito más duras o descuentos por pronto pago que reducen el margen; los contratistas pueden irse con la competencia.` });
    }
    if (pdp - actual.pdp > E.masPDP) {
      alertas.push({ nivel: "advertencia", titulo: "Riesgo de perder condiciones de compra",
        mensaje: `Pedir ${(pdp - actual.pdp).toFixed(0)} días más de plazo puede costar el descuento por volumen o un precio más alto; si el descuento supera la tasa de ${datos.tasa}%, no conviene.` });
    }
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
      mensaje: "Las ventas usadas en el PCC son 0. Revisa las ventas y el % a crédito." });
  }
  if (r.pdp === null) {
    alertas.push({ nivel: "critico", titulo: "No se puede calcular el PDP",
      mensaje: "Las compras son 0, así que no hay base diaria de proveedores." });
  }
  if (Math.abs(r.compras - r.comprasCalculadas) > 0.005) {
    alertas.push({ nivel: "info", titulo: "Compras del caso vs compras calculadas",
      mensaje: `El caso reporta compras de ${formatoPesos(r.compras)}, pero Costo de ventas + Inv. final − Inv. inicial = ${formatoPesos(r.comprasCalculadas)}. ` +
        `Se usa la cifra reportada en el caso; la diferencia (${formatoPesos(r.comprasCalculadas - r.compras)}) puede deberse a mermas, devoluciones o ajustes de inventario.` });
  }
  if (datos.costoVentas > datos.ventas) {
    alertas.push({ nivel: "advertencia", titulo: "Costo de ventas mayor que las ventas",
      mensaje: "El margen bruto sería negativo. Verifica que ambas cifras sean del mismo periodo y estén en las mismas unidades." });
  }
  for (const [clave, nombre] of [["pci", "PCI"], ["pcc", "PCC"], ["pdp", "PDP"]]) {
    if (r[clave] !== null && r[clave] > datos.dias) {
      alertas.push({ nivel: "advertencia", titulo: `${nombre} mayor que un año`,
        mensaje: `El ${nombre} (${formatoDias(r[clave])}) supera los días del año. Posible error de captura.` });
    }
  }
  return alertas;
}
