import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteReconstruccion() {
  console.log('\n--- Agente 2: Reconstrucción de DB ---');

  // OBSERVA: baja todo el historial del Topic
  const mensajes = await getTopicMessages(CONFIG.topicId);
  console.log(`Mensajes encontrados en Hedera: ${mensajes.length}`);

  if (mensajes.length === 0) {
    console.log('Topic vacío. Nada que reconstruir.');
    return { estado: 'VACIO', registros: [] };
  }

  // RAZONA: decodifica y valida cada mensaje
  const registros   = [];
  const corrompidos = [];

  for (const msg of mensajes) {
    const payload = decodeMessage(msg.message);

    if (!payload) {
      corrompidos.push({ sequenceNumber: msg.sequence_number, error: 'No decodificable' });
      continue;
    }

    registros.push({
      sequenceNumber:     msg.sequence_number,
      consensusTimestamp: msg.consensus_timestamp,
      hash:               payload.hash,
      movimiento:         payload.data  // tus datos financieros
    });
  }

  // ACTÚA: reporta qué reconstruyó y qué no pudo
  const resultado = {
    estado:           corrompidos.length === 0 ? 'RECONSTRUCCION_COMPLETA' : 'RECONSTRUCCION_PARCIAL',
    totalEnHedera:    mensajes.length,
    reconstruidos:    registros.length,
    corrompidos:      corrompidos.length,
    registros,        // esto lo mandás a tu DB
    corrompidos,
    timestamp:        new Date().toISOString()
  };

  console.log(`Reconstruidos: ${registros.length} / ${mensajes.length}`);
  if (corrompidos.length > 0) {
    console.log('Registros no recuperables:', corrompidos);
  }

  // Acá llamás a tu backend para que reinserte los registros en PostgreSQL
  // await db.rebuild(registros);

  return resultado;
}