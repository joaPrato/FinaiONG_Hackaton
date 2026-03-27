import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteReconstruccion() {
  console.log('\n--- 🕵️  AGENTE 2: AUDITOR DE ANOMALÍAS ---');

  try {
    const mensajes = await getTopicMessages(CONFIG.topicId);
    
    if (!mensajes || mensajes.length === 0) {
      console.log('ℹ️  Auditor: El Topic de Hedera está vacío.');
      return { estado: 'VACIO', mensaje: 'Sin datos para auditar.' };
    }

    // --- LÓGICA DE BUCEO (Igual que Agente 1) ---
    const egresos = [];
    mensajes.forEach(msg => {
      const payload = decodeMessage(msg.message);
      const data = payload?.data || payload;

      const procesar = (item) => { 
        if (item?.type === 'expense') egresos.push(item); 
      };

      if (Array.isArray(data?.registros)) data.registros.forEach(procesar);
      else if (data && typeof data === 'object' && data['0']) {
        Object.values(data).forEach(v => { if (typeof v === 'object') procesar(v); });
      } else {
        procesar(data);
      }
    });

    console.log(`🔎 Auditoría: Se analizaron ${mensajes.length} mensajes. Gastos encontrados: ${egresos.length}`);

    // CASO 2: Sin gastos
    if (egresos.length === 0) {
      console.log('ℹ️  Auditor: No se detectaron egresos (expenses) para comparar.');
      return { estado: 'SIN_EGRESOS', mensaje: 'Carga un gasto para iniciar la auditoría.' };
    }

    // CASO 3: Solo un gasto
    if (egresos.length < 2) {
      console.log(`📊 Auditoría: Primer gasto detectado ($${egresos[0].amount}).`);
      console.log('💡 IA en aprendizaje: Necesito un segundo gasto para establecer una línea base.');
      return { 
        estado: 'APRENDIENDO', 
        mensaje: 'Fase de aprendizaje: 1 solo gasto registrado.',
        ultimo: egresos[0]
      };
    }

    // --- LÓGICA DE AUDITORÍA NORMAL ---
    const ultimoGasto = egresos[0];
    const historicoEgresos = egresos.slice(1);
    const sumaHistorica = historicoEgresos.reduce((s, e) => s + Number(e.amount || 0), 0);
    const promedioHistorico = sumaHistorica / historicoEgresos.length;

    console.log(`⚖️  Comparando: Gasto Actual ($${ultimoGasto.amount}) vs Promedio Histórico ($${promedioHistorico.toFixed(2)})`);

    const factorAnomalia = 1.5; 
    const limitePermitido = promedioHistorico * factorAnomalia;

    if (ultimoGasto.amount > limitePermitido) {
      const desviacion = ((ultimoGasto.amount / promedioHistorico - 1) * 100).toFixed(0);
      console.log(`🚨 ¡ANOMALÍA! Gasto excede el promedio en un ${desviacion}%`);
      return {
        estado: 'ALERTA',
        tipo: 'GASTO_ANOMALO',
        monto: ultimoGasto.amount.toFixed(2),
        promedio: promedioHistorico.toFixed(2),
        mensaje: `Gasto inusual detectado: $${ultimoGasto.amount}`
      };
    }

    console.log('✅ Auditoría: Gasto validado dentro del rango normal.');
    return {
      estado: 'OK',
      mensaje: 'Normalidad operativa.',
      promedioReferencia: promedioHistorico.toFixed(2)
    };

  } catch (error) {
    console.error('❌ Error en Agente 2:', error.message);
    return { estado: 'ERROR', mensaje: error.message };
  }
}