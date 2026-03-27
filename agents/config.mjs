import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Buscamos el .env en la raíz del proyecto
dotenv.config({ path: resolve(__dirname, '../.env') });

export const CONFIG = {
  // Ahora apuntamos a las variables de tus compañeros
  topicId:   process.env.HEDERA_TOPIC_ID, 
  accountId: process.env.HEDERA_ACCOUNT_ID,
  
  // Estas se mantienen igual o con fallback
  umbralUsd: Number(process.env.UMBRAL_USD) || 50, 
  
  baseUrl:   process.env.HEDERA_NETWORK === 'mainnet'
               ? 'https://mainnet.mirrornode.hedera.com'
               : 'https://testnet.mirrornode.hedera.com'
};

// Logs para que verifiques en la terminal si cargó bien
console.log('--- Configuración de Agentes ---');
console.log('Account ID:', CONFIG.accountId);
console.log('Topic ID:  ', CONFIG.topicId);
console.log('Network:   ', process.env.HEDERA_NETWORK || 'testnet');
console.log('--------------------------------');