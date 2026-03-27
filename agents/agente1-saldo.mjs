import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteSaldo() {
  console.log('\n--- Agente 1: Guardián de Liquidez (Últimos 30 días) ---');

  try {
    // 1. OBSERVA: Obtenemos el historial completo del Topic de Hedera
    const mensajes = await getTopicMessages(CONFIG.topicId);
    
    // Definimos el rango de tiempo: últimos 30 días
    const ahora = Date.now() / 1000;
    const hace30Dias = ahora - (30 * 24 * 60 * 60);

    let ingresosMes = 0;
    let egresosMes = 0;

    // 2. RAZONA: Filtramos y calculamos el flujo de caja del mes
    mensajes.forEach(msg => {
      const timestamp = Number(msg.consensus_timestamp.split('.')[0]);
      
      // Solo procesamos si ocurrió en los últimos 30 días
      if (timestamp >= hace30Dias) {
        const payload = decodeMessage(msg.message);
        const data = payload?.data || payload;

        if (data?.type === 'income') {
          ingresosMes += Number(data.amount || 0);
        } else if (data?.type === 'expense') {
          egresosMes += Number(data.amount || 0);
        }
      }
    });

    const flujoNetoMes = ingresosMes - egresosMes;
    
    console.log(`Resumen 30 días: +$${ingresosMes.toFixed(2)} | -$${egresosMes.toFixed(2)}`);
    console.log(`Flujo Neto Actual: $${flujoNetoMes.toFixed(2)} USD`);
    console.log(`Umbral de Seguridad: $${CONFIG.umbralUsd} USD`);

    // 3. ACTÚA: Si el flujo neto no supera el umbral de supervivencia, disparamos ALERTA_ROJA
    if (flujoNetoMes < CONFIG.umbralUsd) {
      const deficit = (CONFIG.umbralUsd - flujoNetoMes).toFixed(2);
      
      const alerta = {
        estado: 'ALERTA',
        tipo: 'ALERTA_LIQUIDEZ_CRITICA',
        flujoMensual: flujoNetoMes.toFixed(2),
        ingresos: ingresosMes.toFixed(2),
        egresos: egresosMes.toFixed(2),
        umbralRequerido: CONFIG.umbralUsd,
        deficit: deficit,
        mensaje: `🚨 ALERTA ROJA: El flujo de caja de los últimos 30 días ($${flujoNetoMes.toFixed(2)}) es insuficiente. Se necesitan $${deficit} USD adicionales para cubrir el umbral operativo.`,
        timestamp: new Date().toISOString()
      };

      console.log('¡ATENCIÓN! Agente 1 detectó riesgo de quiebra operativa.');
      return alerta;
    }

    // Si todo está bien
    return { 
      estado: 'OK', 
      flujoMensual: flujoNetoMes.toFixed(2),
      mensaje: 'Salud financiera mensual estable. La ONG tiene oxígeno operativo.',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error crítico en Agente 1:', error.message);
    return { 
      estado: 'ERROR', 
      mensaje: 'No se pudo analizar la liquidez operativa.' 
    };
  }
}