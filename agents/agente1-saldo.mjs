import { getAccountBalance, getHbarPriceUsd } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteSaldo() {
  console.log('\n--- Agente 1: Monitor de saldo ---');

  try {
    // 1. OBSERVA: Usamos CONFIG.accountId que ahora viene de HEDERA_ACCOUNT_ID
    const hbar   = await getAccountBalance(CONFIG.accountId) || 0;
    const precio = await getHbarPriceUsd() || 0.07; // Fallback si falla la API
    const saldoUsd = hbar * precio;

    console.log(`Saldo: ${hbar.toFixed(2)} HBAR = $${saldoUsd.toFixed(2)} USD`);

    // 2. RAZONA Y ACTÚA
    // Comparamos contra el umbral que configuramos en config.mjs
    if (saldoUsd < CONFIG.umbralUsd) {
      const deficitVal = (CONFIG.umbralUsd - saldoUsd).toFixed(2);
      
      const alerta = {
        estado:    'ALERTA',
        tipo:      'ALERTA_LIQUIDEZ',
        saldoHbar: hbar.toFixed(2),
        saldoUsd:  saldoUsd.toFixed(2),
        umbralUsd: CONFIG.umbralUsd,
        deficit:   deficitVal,
        mensaje:   `⚠️ Alerta de liquidez: Saldo insuficiente. Faltan $${deficitVal} USD para alcanzar el mínimo operativo.`,
        timestamp: new Date().toISOString()
      };

      console.log('¡ATENCIÓN! Alerta emitida:', alerta.mensaje);
      return alerta;
    }

    console.log('Saldo OK. La ONG tiene liquidez suficiente.');
    return { 
      estado: 'OK', 
      saldoUsd: saldoUsd.toFixed(2),
      mensaje: 'Fondos operativos estables.'
    };

  } catch (error) {
    console.error('❌ Error crítico en Agente 1:', error.message);
    return { 
      estado: 'ERROR', 
      mensaje: 'No se pudo verificar el saldo.' 
    };
  }
}