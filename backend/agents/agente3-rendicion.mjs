import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteRendicion() {
  console.log('\n--- 📈 AGENTE 3: ESTRATEGA DE SOSTENIBILIDAD ---');

  try {
    const mensajes = await getTopicMessages(CONFIG.topicId);
    
    if (!mensajes || mensajes.length === 0) {
      console.log('ℹ️  Estratega: No hay datos suficientes para proyectar tendencias.');
      return { estado: 'SIN_DATOS', mensaje: 'Blockchain vacía.' };
    }

    const ahora = Date.now() / 1000;
    const unMesSeg = 30 * 24 * 60 * 60;

    const calcularTotales = (msjs, inicio, fin) => {
      let inc = 0, exp = 0;
      msjs.forEach(m => {
        const ts = Number(m.consensus_timestamp.split('.')[0]);
        if (ts >= inicio && ts <= fin) {
          const payload = decodeMessage(m.message);
          const content = payload?.data || payload;

          const procesar = (item) => {
            if (item?.type === 'income') inc += Number(item.amount || 0);
            if (item?.type === 'expense') exp += Number(item.amount || 0);
          };

          if (Array.isArray(content?.registros)) {
            content.registros.forEach(r => procesar(r));
          } else if (content && typeof content === 'object' && content['0']) {
            Object.values(content).forEach(v => { if (typeof v === 'object') procesar(v); });
          } else {
            procesar(content);
          }
        }
      });
      return { inc, exp };
    };

    // Análisis de Periodos
    const mesActual = calcularTotales(mensajes, ahora - unMesSeg, ahora);
    const mesPasado = calcularTotales(mensajes, ahora - (unMesSeg * 2), ahora - unMesSeg);

    console.log(`📅 Periodo Actual:  +$${mesActual.inc.toFixed(2)} | -$${mesActual.exp.toFixed(2)}`);
    console.log(`📅 Periodo Anterior: +$${mesPasado.inc.toFixed(2)} | -$${mesPasado.exp.toFixed(2)}`);

    // RAZONA: Cálculo de Riesgo y Sostenibilidad
    const flujoActual = mesActual.inc - mesActual.exp;
    const crecimientoGastos = mesPasado.exp > 0 ? ((mesActual.exp - mesPasado.exp) / mesPasado.exp) * 100 : 0;
    
    let recomendacion = "Análisis completado: Se requiere más historial para detectar tendencias negativas.";
    let alertaEstrategica = false;

    console.log('🤖 IA Analizando tendencias...');

    if (mesActual.exp > mesActual.inc && mesActual.exp > 0) {
      alertaEstrategica = true;
      recomendacion = "⚠️ Sugerencia: Los gastos actuales superan los ingresos mensuales. Iniciar campaña de recaudación.";
      console.log('🚨 TENDENCIA NEGATIVA: El gasto supera al ingreso en el periodo actual.');
    } else if (mesActual.inc > mesActual.exp) {
      recomendacion = "✅ Sostenibilidad OK: Los ingresos superan los gastos en el periodo actual.";
      console.log('💎 TENDENCIA POSITIVA: Modelo de ingresos saludable.');
    }

    if (crecimientoGastos > 20) {
      console.log(`🚩 ALERTA DE ESCALADA: Los gastos subieron un ${crecimientoGastos.toFixed(1)}% respecto al mes pasado.`);
    }

    console.log(`💡 Veredicto IA: ${recomendacion}`);

    return {
      estado: alertaEstrategica ? 'ADVERTENCIA' : 'OK',
      data: {
        ingresosMes: mesActual.inc.toFixed(2),
        gastosMes: mesActual.exp.toFixed(2),
        balanceMes: flujoActual.toFixed(2),
        variacionGasto: `${crecimientoGastos.toFixed(1)}%`
      },
      recomendacion,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ [Agente 3 Error]:', error.message);
    return { estado: 'ERROR', mensaje: error.message };
  }
}