import { CONFIG } from './config.mjs';

export async function getAccountBalance(accountId) {
  const url = `${CONFIG.baseUrl}/api/v1/accounts/${accountId}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const balanceTinybars = data?.balance?.balance;

    if (balanceTinybars === undefined) return 0;
    return balanceTinybars / 100_000_000;

  } catch (error) {
    console.error('❌ Error obteniendo balance de cuenta:', error.message);
    return 0;
  }
}

export async function getHbarPriceUsd() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data?.['hedera-hashgraph']?.usd || 0.07;

  } catch (error) {
    console.error('❌ Error obteniendo precio HBAR:', error.message);
    return 0.07; // fallback
  }
}

export async function getTopicMessages(topicId) {
  let messages = [];
  let url = `${CONFIG.baseUrl}/api/v1/topics/${topicId}/messages?limit=100`;

  try {
    while (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      messages.push(...data.messages);

      url = data.links?.next ? `${CONFIG.baseUrl}${data.links.next}` : null;
    }
    // Solo un log final de confirmación técnica
    console.log(`🔗 Hedera Mirror Node: ${messages.length} mensajes sincronizados.`);
    return messages;

  } catch (error) {
    console.error('❌ Error obteniendo mensajes del Topic:', error.message);
    throw error;
  }
}

export function decodeMessage(base64) {
  try {
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    // Si no es un JSON válido o falla el decode, simplemente devolvemos null sin ensuciar la consola
    return null;
  }
}