import { CONFIG } from './config.mjs';

export async function getTopicMessages(topicId) {
  const messages = [];
  let url = `${CONFIG.baseUrl}/api/v1/topics/${topicId}/messages?limit=100`;

  // Pagina automáticamente hasta traer todos los mensajes
  while (url) {
    const res  = await fetch(url);
    const data = await res.json();
    messages.push(...data.messages);
    url = data.links?.next
      ? `${CONFIG.baseUrl}${data.links.next}`
      : null;
  }
  return messages;
}

export async function getAccountBalance(accountId) {
  const res  = await fetch(`${CONFIG.baseUrl}/api/v1/accounts/${accountId}`);
  const data = await res.json();
  // El balance viene en tinybars (1 HBAR = 100,000,000 tinybars)
  return data.balance.balance / 100_000_000;
}

export async function getHbarPriceUsd() {
  // CoinGecko público, sin API key
  const res  = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
  const data = await res.json();
  return data['hedera-hashgraph'].usd;
}

export function decodeMessage(base64) {
  try {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}