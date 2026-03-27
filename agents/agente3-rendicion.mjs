import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteRendicion(fechaDesde, fechaHasta) {
  console.log('\n--- Agente 3: Reporte de rendición ---');
  console.log(`Período: ${fechaDesde} → ${fechaHasta}`);

  // OBSERVA
  const mensajes = await getTopicMessages(CONFIG.topicId);

  // RAZONA: filtra por período y agrupa
  const desde = new Date(fechaDesde).getTime() / 1000;
  const hasta = new Date(fechaHasta).getTime() / 1000;

  const movimientos = mensajes
    .map(msg => ({
      timestamp: Number(msg.consensus_timestamp.split('.')[0]),
      seq:       msg.sequence_number,
      payload:   decodeMessage(msg.message)
    }))
    .filter(m => m.payload && m.timestamp >= desde && m.timestamp <= hasta)
    .map(m => m.payload.data);

  // Agrupa por clasificación
  const ingresos = movimientos.filter(m => m?.classification?.base === 'ingreso');
  const egresos  = movimientos.filter(m => m?.classification?.base === 'egreso');
  const activos  = movimientos.filter(m => m?.classification?.base?.includes('activo'));

  const totalIngresos = ingresos.reduce((s, m) => s + (m.amounts?.real || 0), 0);
  const totalEgresos  = egresos.reduce((s,  m) => s + (m.amounts?.real || 0), 0);

  // ACTÚA: produce el reporte
  const reporte = {
    periodo:        { desde: fechaDesde, hasta: fechaHasta },
    resumen: {
      totalMovimientos: movimientos.length,
      ingresos:         { cantidad: ingresos.length, total: totalIngresos },
      egresos:          { cantidad: egresos.length,  total: totalEgresos  },
      activos:          { cantidad: activos.length },
      resultado:        totalIngresos - totalEgresos
    },
    movimientos,   // detalle completo para el PDF/Excel
    generadoEn:    new Date().toISOString(),
    fuenteDatos:   `Hedera HCS Topic ${CONFIG.topicId} — inmutable y verificable`
  };

  console.log('Resumen:', reporte.resumen);
  return reporte;
}