import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteSaldo() {
  console.log('\n--- 🛡️  AGENTE 1: GUARDIÁN DE LIQUIDEZ ---');

  try {
    const mensajes = await getTopicMessages(CONFIG.topicId);
    
    if (!mensajes || mensajes.length === 0) {
      return { estado: 'VACIO', mensaje: 'Sin registros en Hedera.' };
    }

    const ahora = Date.now() / 1000;
    const hace30Dias = ahora - (30 * 24 * 60 * 60);

    let ingresosMes = 0;
    let egresosMes = 0;

    // Procesamos cada mensaje sin imprimir el contenido crudo
    mensajes.forEach(msg => {
      const timestamp = Number(msg.consensus_timestamp.split('.')[0]);
      
      if (timestamp >= hace30Dias) {
        const payload = decodeMessage(msg.message);
        const data = payload?.data || payload;

        const procesarItem = (item) => {
          if (!item) return;
          if (item.type === 'income') ingresosMes += Number(item.amount || 0);
          if (item.type === 'expense') egresosMes += Number(item.amount || 0);
        };

        // Lógica de buceo silenciosa
        if (Array.isArray(data?.registros)) {
          data.registros.forEach(r => procesarItem(r));
        } else if (data && typeof data === 'object' && data['0']) {
          Object.values(data).forEach(v => { if (typeof v === 'object') procesarItem(v); });
        } else {
          procesarItem(data);
        }
      }
    });

    const flujoNetoMes = ingresosMes - egresosMes;
    
    // Solo logueamos el resultado final
    console.log(`📊 Análisis completado: +$${ingresosMes.toFixed(2)} / -$${egresosMes.toFixed(2)}`);
    console.log(`💡 Flujo Neto: $${flujoNetoMes.toFixed(2)} USD (Umbral: $${CONFIG.umbralUsd})`);

    if (flujoNetoMes < CONFIG.umbralUsd) {
      console.log('⚠️  ALERTA EMITIDA: Riesgo de liquidez detectado.');
      return {
        estado: 'ALERTA',
        flujoMensual: flujoNetoMes.toFixed(2),
        mensaje: `Flujo insuficiente ($${flujoNetoMes.toFixed(2)}).`,
        timestamp: new Date().toISOString()
      };
    }

    console.log('✅ Estado: Salud financiera estable.');
    return { 
      estado: 'OK', 
      flujoMensual: flujoNetoMes.toFixed(2),
      mensaje: 'Liquidez operativa confirmada.',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error en Agente 1:', error.message);
    return { estado: 'ERROR', mensaje: 'Fallo en análisis.' };
  }
}