import { agenteSaldo }          from './agente1-saldo.mjs';
import { agenteReconstruccion } from './agente2-reconstruccion.mjs';
import { agenteRendicion }      from './agente3-rendicion.mjs';

async function main() {
  await agenteSaldo();
  await agenteReconstruccion();
  await agenteRendicion('2025-01-01', '2025-03-31');
}

main().catch(console.error);

