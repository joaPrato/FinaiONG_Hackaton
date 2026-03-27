import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteReconstruccion() {
  console.log('\n--- Agente 2: Auditor de Anomalías y Gastos ---');

  try {
    const mensajes = await getTopicMessages(CONFIG.topicId);
    
    // CASO 1: Topic totalmente vacío
    if (!mensajes || mensajes.length === 0) {
      console.log('ℹ️ El canal de auditoría en Hedera está vacío.');
      return { 
        estado: 'SISTEMA_VIRGEN', 
        mensaje: 'La auditoría está lista pero no se encontraron registros en la blockchain.',
        instruccion: 'Para activar al Agente 2, primero debes registrar un gasto (expense) usando el chat de la ONG.',
        fuente: `Topic Hedera ${CONFIG.topicId}`
      };
    }

    const egresos = mensajes
      .map(msg => decodeMessage(msg.message)?.data || decodeMessage(msg.message))
      .filter(m => m?.type === 'expense');

    // CASO 2: Hay mensajes, pero ninguno es un gasto
    if (egresos.length === 0) {
      return { 
        estado: 'SIN_EGRESOS', 
        mensaje: 'Se detectaron movimientos (ingresos/activos), pero no hay gastos (expenses) para auditar.',
        totalMensajes: mensajes.length,
        proximaAccion: 'Carga un gasto para calcular el promedio de anomalías.'
      };
    }

    // CASO 3: Solo hay un gasto (no se puede promediar)
    if (egresos.length < 2) {
      return { 
        estado: 'APRENDIENDO', 
        mensaje: 'Auditoría en fase de aprendizaje. Tengo 1 solo gasto registrado.',
        instruccion: 'Se requiere un segundo gasto para empezar a comparar desviaciones y promedios.',
        ultimoRegistro: egresos[0]
      };
    }

    // --- LÓGICA DE AUDITORÍA NORMAL ---
    const ultimoGasto = egresos[0];
    const historicoEgresos = egresos.slice(1);
    const sumaHistorica = historicoEgresos.reduce((s, e) => s + Number(e.amount || 0), 0);
    const promedioHistorico = sumaHistorica / historicoEgresos.length;

    const factorAnomalia = 1.5; 
    const limitePermitido = promedioHistorico * factorAnomalia;

    if (ultimoGasto.amount > limitePermitido) {
      const desviacion = ((ultimoGasto.amount / promedioHistorico - 1) * 100).toFixed(0);
      return {
        estado: 'ALERTA',
        tipo: 'GASTO_ANOMALO',
        monto: ultimoGasto.amount.toFixed(2),
        promedio: promedioHistorico.toFixed(2),
        desviacion: `${desviacion}%`,
        mensaje: `🚨 ¡Atención! Este gasto es un ${desviacion}% superior al promedio habitual.`
      };
    }

    return {
      estado: 'OK',
      mensaje: 'Gastos dentro de la normalidad operativa.',
      promedioReferencia: promedioHistorico.toFixed(2)
    };

  } catch (error) {
    console.error('❌ Error en Agente 2:', error.message);
    return { estado: 'ERROR', mensaje: 'Fallo en la conexión con la red de auditoría.' };
  }
}