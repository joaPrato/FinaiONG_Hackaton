import { getAccountBalance, getHbarPriceUsd } from './mirrorNode.mjs';
import { CONFIG } from './config.mjs';

export async function agenteSaldo() {
  console.log('\n--- Agente 1: Monitor de saldo ---');

  // OBSERVA
  const hbar      = await getAccountBalance(CONFIG.accountId);
  const precio    = await getHbarPriceUsd();
  const saldoUsd  = hbar * precio;

  console.log(`Saldo: ${hbar.toFixed(2)} HBAR = $${saldoUsd.toFixed(2)} USD`);

  // RAZONA Y ACTÚA
  if (saldoUsd < CONFIG.umbralUsd) {
    const alerta = {
      tipo:      'ALERTA_LIQUIDEZ',
      saldoHbar: hbar.toFixed(2),
      saldoUsd:  saldoUsd.toFixed(2),
      umbralUsd: CONFIG.umbralUsd,
      deficit:   (CONFIG.umbralUsd - saldoUsd).toFixed(2),
      mensaje:   `Saldo por debajo del umbral. Déficit: $${(CONFIG.umbralUsd - saldoUsd).toFixed(2)} USD`,
      timestamp: new Date().toISOString()
    };

    // Acá conectás con tu backend: webhook, email, push, lo que uses
    console.log('ALERTA EMITIDA:', alerta);
    return { estado: 'ALERTA', ...alerta };
  }

  console.log('Saldo OK. Sin alertas.');
  return { estado: 'OK', saldoUsd: saldoUsd.toFixed(2) };
}