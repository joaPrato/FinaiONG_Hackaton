import { CONFIG } from './config.mjs';

export async function getAccountBalance(accountId) {
  const url = `${CONFIG.baseUrl}/api/v1/accounts/${accountId}`;
  console.log('🌐 GET Balance URL:', url);

  try {
    const res = await fetch(url);

    console.log('📡 Status:', res.status);

    const text = await res.text(); // 🔥 IMPORTANTE (ver respuesta cruda)
    console.log('📦 Raw response:', text);

    if (!res.ok) {
      console.error('❌ Error HTTP en getAccountBalance:', res.status);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = JSON.parse(text);
    console.log('📊 Parsed response:', data);

    const balanceTinybars = data?.balance?.balance;

    if (balanceTinybars === undefined) {
      console.error('❌ No vino balance en la respuesta');
      return 0;
    }

    return balanceTinybars / 100_000_000;

  } catch (error) {
    console.error('❌ Error en getAccountBalance:', error.message);
    throw error;
  }
}

export async function getHbarPriceUsd() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd';
  console.log('🌐 GET Precio URL:', url);

  try {
    const res = await fetch(url);

    console.log('📡 Status:', res.status);

    const text = await res.text();
    console.log('📦 Raw response:', text);

    if (!res.ok) {
      console.error('❌ Error HTTP en precio:', res.status);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = JSON.parse(text);
    console.log('📊 Parsed response:', data);

    return data?.['hedera-hashgraph']?.usd || 0;

  } catch (error) {
    console.error('❌ Error en getHbarPriceUsd:', error.message);
    return 0.07; // fallback
  }
}

export async function getTopicMessages(topicId) {
  const messages = [];
  let url = `${CONFIG.baseUrl}/api/v1/topics/${topicId}/messages?limit=100`;

  console.log('🌐 Iniciando fetch de mensajes:', url);

  try {
    while (url) {
      console.log('➡️ Fetch:', url);

      const res = await fetch(url);
      console.log('📡 Status:', res.status);

      const data = await res.json();
      console.log('📦 Data:', data);

      messages.push(...data.messages);

      url = data.links?.next
        ? `${CONFIG.baseUrl}${data.links.next}`
        : null;
    }

    console.log('✅ Total mensajes:', messages.length);
    return messages;

  } catch (error) {
    console.error('❌ Error en getTopicMessages:', error.message);
    throw error;
  }
}

export function decodeMessage(base64) {
  try {
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    console.log('🔓 Decoded message:', decoded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Error decodificando mensaje:', error.message);
    return null;
  }
}