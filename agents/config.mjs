import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

export const CONFIG = {
  topicId:   process.env.TOPIC_ID,
  accountId: process.env.ACCOUNT_ID,
  umbralUsd: Number(process.env.UMBRAL_USD) || 500,
  baseUrl:   process.env.HEDERA_NETWORK === 'mainnet'
               ? 'https://mainnet.mirrornode.hedera.com'
               : 'https://testnet.mirrornode.hedera.com'
};
console.log('Topic ID cargado:', CONFIG.topicId);
console.log('Network:', CONFIG.baseUrl);