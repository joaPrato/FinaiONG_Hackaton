require("dotenv").config();
const {
  Client,
  TopicCreateTransaction,
  PrivateKey,
} = require("@hashgraph/sdk");

async function main() {
  try {
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const pkString = process.env.HEDERA_PRIVATE_KEY;

    if (!accountId || !pkString) {
      console.error("Faltan datos en el .env");
      return;
    }

    // Intentamos cargar la llave de forma inteligente
    let operatorKey;
    try {
      // Probamos primero como ECDSA (lo más común en cuentas nuevas)
      operatorKey = PrivateKey.fromStringECDSA(pkString);
    } catch (e) {
      // Si falla, probamos el formato estándar
      operatorKey = PrivateKey.fromString(pkString);
    }

    const client = Client.forTestnet();
    client.setOperator(accountId, operatorKey);

    console.log("--- Intentando crear el Topic en Hedera ---");

    const transaction = new TopicCreateTransaction().setTopicMemo("FINAI_LOGS");

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    console.log("-----------------------------------------------");
    console.log("✅ ¡ÉXITO! Topic creado.");
    console.log(`Tu HEDERA_TOPIC_ID es: ${receipt.topicId}`);
    console.log("-----------------------------------------------");
  } catch (error) {
    console.error("❌ Error detallado:");
    console.error(error.message);
    console.log(
      "\nTIP: Revisa que tu Private Key sea la 'HEX Encoded' del portal de Hedera.",
    );
  }
}

main();
