import { getTopicMessages, decodeMessage } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteReconstruccion() {
  console.log('\n--- 🕵️  AGENTE 2: AUDITOR DE ANOMALÍAS ---');

  try {
    // 1. OBTENER Y REVERSAR: Para que el índice [0] sea el movimiento más reciente
    const mensajesRaw = await getTopicMessages(CONFIG.topicId);
    const mensajes = mensajesRaw.reverse(); 
    
    if (!mensajes || mensajes.length === 0) {
      console.log('ℹ️  Auditor: El Topic de Hedera está vacío.');
      return { estado: 'VACIO', mensaje: 'Sin datos para auditar.' };
    }

    // --- LÓGICA DE BUCEO ---
    const egresos = [];
    mensajes.forEach(msg => {
      const payload = decodeMessage(msg.message);
      const data = payload?.data || payload;

      const procesar = (item) => { 
        // Aseguramos que el monto sea un número para evitar errores de cálculo
        if (item?.type === 'expense' && item.amount !== undefined) {
          egresos.push({
            ...item,
            amount: Number(item.amount)
          });
        } 
      };

      if (Array.isArray(data?.registros)) {
        data.registros.forEach(procesar);
      } else if (data && typeof data === 'object' && data['0']) {
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

    // CASO 3: Solo un gasto (Ahora egresos[0] es el más nuevo)
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
    // Con el .reverse(), el index 0 es el último gasto realizado.
    const ultimoGasto = egresos[0]; 
    const historicoEgresos = egresos.slice(1);
    
    const sumaHistorica = historicoEgresos.reduce((s, e) => s + e.amount, 0);
    const promedioHistorico = sumaHistorica / historicoEgresos.length;

    console.log(`⚖️  Comparando Actual: $${ultimoGasto.amount} (${ultimoGasto.description})`);
    console.log(`📊 Promedio de los ${historicoEgresos.length} gastos anteriores: $${promedioHistorico.toFixed(2)}`);

    const factorAnomalia = 1.5; // Alerta si es 50% superior al promedio
    const limitePermitido = promedioHistorico * factorAnomalia;

    if (ultimoGasto.amount > limitePermitido) {
      const desviacion = ((ultimoGasto.amount / promedioHistorico - 1) * 100).toFixed(0);
      console.log(`🚨 ¡ANOMALÍA! Gasto excede el promedio en un ${desviacion}%`);
      return {
        estado: 'ALERTA',
        tipo: 'GASTO_ANOMALO',
        monto: ultimoGasto.amount.toFixed(2),
        promedio: promedioHistorico.toFixed(2),
        desviacion: `${desviacion}%`,
        mensaje: `🚨 Auditoría detectó un gasto inusual: $${ultimoGasto.amount} es un ${desviacion}% superior al promedio habitual.`
      };
    }

    console.log('✅ Auditoría: Gasto validado dentro del rango normal.');
    return {
      estado: 'OK',
      mensaje: 'Normalidad operativa.',
      promedioReferencia: promedioHistorico.toFixed(2),
      montoAnalizado: ultimoGasto.amount.toFixed(2)
    };

  } catch (error) {
    console.error('❌ Error en Agente 2:', error.message);
    return { estado: 'ERROR', mensaje: 'Fallo en la conexión con la red de auditoría.' };
  }
}