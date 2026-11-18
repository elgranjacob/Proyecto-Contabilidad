// =====================================================================
//  DATOS DEL CASO A: FERRETERA DEL NORTE (cifras en millones de pesos)
//  Las claves coinciden con los id de los campos del formulario.
//
//  Verificación a mano con los supuestos por defecto
//  (365 días · PCC con ventas a crédito · PCI con inventario promedio):
//    Ventas a crédito  = 600 × 60%            = 360
//    Inventario prom.  = (180 + 220) ÷ 2      = 200
//    PCI = 200 ÷ (420 ÷ 365)                  = 173.81 días
//    PCC =  50 ÷ (360 ÷ 365)                  =  50.69 días
//    PDP =  70 ÷ (430 ÷ 365)                  =  59.42 días
//    CCE = 173.81 + 50.69 − 59.42             = 165.09 días  (sector: 95)
//    (165.08 si se suman los componentes ya redondeados a 2 decimales)
//  Con 360 días: CCE 162.82 · PCC con ventas totales: 144.81 · PCI con inv. final: 182.47
// =====================================================================

export const CASO_A = {
  ventas:      600,
  pctCredito:  60,
  costoVentas: 420,
  compras:     430,
  invInicial:  180,
  invFinal:    220,
  cxc:         50,
  cxp:         70,
  dias:        "365",
  basePCC:     "credito",
  basePCI:     "promedio",
  tasa:        14,
  sectorCCE:   95,
};
