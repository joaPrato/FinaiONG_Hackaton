import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteRendicion() {
  console.log('\n--- Agente 3: Estratega de Sostenibilidad (Tendencias) ---');

  try {
    // 1. OBSERVA: Intentamos traer el historial de Hedera
    const mensajes = await getTopicMessages(CONFIG.topicId);
    
    // CASO: No hay mensajes en el Topic
    if (!mensajes || mensajes.length === 0) {
      console.log('ℹ️ [Agente 3]: El historial de Hedera está vacío. Sin datos no puedo proyectar tendencias.');
      return { 
        estado: 'DATOS_INSUFICIENTES', 
        mensaje: 'Blockchain vacía: Esperando los primeros registros para iniciar el análisis de sostenibilidad.',
        tip: 'Registra donaciones (income) y gastos (expense) para ver la comparación mensual.',
        fuente: `Topic ${CONFIG.topicId}`
      };
    }

    console.log(`✅ [Agente 3]: Analizando ${mensajes.length} registros para detectar tendencias...`);

    const ahora = Date.now() / 1000;
    const unMesSeg = 30 * 24 * 60 * 60;

    // Función interna para agrupar montos por periodo
    const calcularTotales = (msjs, inicio, fin) => {
      let inc = 0, exp = 0;
      msjs.forEach(m => {
        const ts = Number(m.consensus_timestamp.split('.')[0]);
        if (ts >= inicio && ts <= fin) {
          const payload = decodeMessage(m.message)?.data || decodeMessage(m.message);
          if (data?.type === 'income') inc += Number(data.amount || 0);
          if (data?.type === 'expense') exp += Number(data.amount || 0);
        }
      });
      return { inc, exp };
    };

    // Obtenemos datos del Mes Actual (A) y Mes Pasado (B)
    const mesActual = calcularTotales(mensajes, ahora - unMesSeg, ahora);
    const mesPasado = calcularTotales(mensajes, ahora - (unMesSeg * 2), ahora - unMesSeg);

    // CASO: Hay mensajes pero no hay suficientes para comparar periodos
    if (mesActual.inc === 0 && mesActual.exp === 0 && mesPasado.inc === 0 && mesPasado.exp === 0) {
      console.log('ℹ️ [Agente 3]: Hay mensajes pero ninguno corresponde a ingresos o gastos en los últimos 60 días.');
      return {
        estado: 'SIN_MOVIMIENTOS_RECIENTES',
        mensaje: 'Se detectaron mensajes técnicos en Hedera, pero no hay movimientos financieros recientes para comparar tendencias.'
      };
    }

    // 2. RAZONA: Lógica de tendencias
    const crecimientoGastos = mesPasado.exp > 0 ? ((mesActual.exp - mesPasado.exp) / mesPasado.exp) * 100 : 0;
    const crecimientoIngresos = mesPasado.inc > 0 ? ((mesActual.inc - mesPasado.inc) / mesPasado.inc) * 100 : 0;

    let recomendacion = "El flujo financiero se mantiene equilibrado.";
    let alertaEstrategica = false;

    if (crecimientoGastos > crecimientoIngresos && mesActual.exp > mesActual.inc) {
      alertaEstrategica = true;
      const dif = (crecimientoGastos - crecimientoIngresos).toFixed(0);
      recomendacion = `⚠️ Sugerencia: Iniciar campaña de recaudación urgente. Los costos subieron un ${dif}% más que los ingresos.`;
    }

    // 3. ACTÚA
    console.log('📈 [Agente 3]: Análisis de sostenibilidad completado.');
    return {
      estado: alertaEstrategica ? 'ALERTA_ESTRATEGICA' : 'OK',
      analisis: {
        ingresosMes: mesActual.inc.toFixed(2),
        gastosMes: mesActual.exp.toFixed(2),
        tendenciaGasto: `${crecimientoGastos.toFixed(1)}%`,
        tendenciaIngreso: `${crecimientoIngresos.toFixed(1)}%`
      },
      recomendacion,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ [Agente 3 Error]:', error.message);
    return { estado: 'ERROR', mensaje: 'Fallo en la proyección estratégica.' };
  }
}