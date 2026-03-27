import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteRendicion(fechaDesde, fechaHasta) {
  console.log('\n--- Agente 3: Reporte de rendición ---');

  // 1. OBSERVA: Trae el historial inmutable de Hedera
  const mensajes = await getTopicMessages(CONFIG.topicId);

  // 2. RAZONA: Normaliza fechas y filtra
  // Si no vienen fechas, usamos un rango infinito por defecto
  const desde = fechaDesde ? new Date(fechaDesde).getTime() / 1000 : 0;
  const hasta = fechaHasta ? new Date(fechaHasta).getTime() / 1000 : Date.now() / 1000;

  const movimientos = mensajes
    .map(msg => {
      const payload = decodeMessage(msg.message);
      return {
        timestamp: Number(msg.consensus_timestamp.split('.')[0]),
        seq:       msg.sequence_number,
        // Si tu backend guarda los datos dentro de .data, lo extraemos; si no, usamos el payload directo
        data:      payload?.data || payload 
      };
    })
    // Filtramos por fecha y que el mensaje sea válido
    .filter(m => m.data && m.timestamp >= desde && m.timestamp <= hasta)
    .map(m => ({ ...m.data, hedera_seq: m.seq })); // Agregamos el número de secuencia para auditoría

  // Agrupa por clasificación (Ajustado a la estructura común de tus otros endpoints)
  const ingresos = movimientos.filter(m => m?.type === 'income' || m?.classification?.base === 'ingreso');
  const egresos  = movimientos.filter(m => m?.type === 'expense' || m?.classification?.base === 'egreso');
  const activos  = movimientos.filter(m => m?.type === 'asset' || m?.classification?.base?.includes('activo'));

  const totalIngresos = ingresos.reduce((s, m) => s + (m.amount || m.amounts?.real || 0), 0);
  const totalEgresos  = egresos.reduce((s, m) => s + (m.amount || m.amounts?.real || 0), 0);

  // 3. ACTÚA: Produce el reporte estructurado
  const reporte = {
    estado: 'EXITO',
    periodo: { desde: fechaDesde || 'Inicio', hasta: fechaHasta || 'Ahora' },
    resumen: {
      totalMovimientos: movimientos.length,
      ingresos: { cantidad: ingresos.length, total: totalIngresos.toFixed(2) },
      egresos:  { cantidad: egresos.length,  total: totalEgresos.toFixed(2)  },
      activos:  { cantidad: activos.length },
      balanceNeto: (totalIngresos - totalEgresos).toFixed(2)
    },
    detalles: movimientos, // Esto es lo que va a la tabla del Front
    generadoEn: new Date().toISOString(),
    fuenteDatos: `Hedera HCS Topic ${CONFIG.topicId} — Inmutable y Verificable`
  };

  console.log('✅ Reporte generado:', reporte.resumen);
  return reporte;
}