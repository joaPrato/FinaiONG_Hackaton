require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey,
} = require("@hashgraph/sdk");

// --- SE IMPORTAN AMBAS LIBRERÍAS PARA DESPUES USAR OPENAI ---
//const OpenAI = require("openai");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN HEDERA (Siempre activa) ---
const client = Client.forTestnet();
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
client.setOperator(process.env.HEDERA_ACCOUNT_ID, operatorKey);

// --- CONFIGURACIÓN DE IA (INTERCAMBIABLE) ---

// 🟢 OPCIÓN A: OPENAI (Descomenta si vas a usar OpenAI)
// const aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const AI_MODEL = "gpt-4o-mini";

// 🟠 OPCIÓN B: GROQ (ACTIVA POR DEFECTO) SI SE USA OPENAI, HAY QUE COMENTAR ESTO
const aiClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const AI_MODEL = "llama-3.3-70b-versatile";

//SE PUEDEN AGREGAR MAS CATEGORÍAS SI HACE FALTA, PERO HAY QUE MANTENER EL FORMATO
// DE LA RESPUESTA JSON PARA QUE EL FRONT PUEDA LEERLO BIEN.
// SI SE USA OPENAI, HAY QUE AJUSTAR EL PROMPT EN CONSECUENCIA
// (CAMBIAR "Eres el contador de FINAI ONG" POR "Eres un modelo de Groq especializado
// en contabilidad para ONG llamado FINAI Contador", POR EJEMPLO).
const CATEGORIES_PROMPT = `
Categorías permitidas:
- INCOME: Donation_Individual, Grant_Government, Event_Fundraising, Corporate_Partnership.
- EXPENSE: Program_Direct_Impact, Operational_Costs, Human_Resources, Marketing.
- DEBT: Supplier_Pending, Loan_Repayment.
- ASSET: Cash_Bank, Physical_Inventory, Fixed_Asset.
`;

app.post("/api/record", async (req, res) => {
  const { text, userWallet } = req.body;

  if (!text || !userWallet) {
    return res.status(400).json({ error: "Faltan datos (texto o wallet)." });
  }

  try {
    console.log(`Procesando con modelo: ${AI_MODEL}...`);

    // La sintaxis es casi idéntica para ambos
    const chatCompletion = await aiClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres el contador de FINAI ONG. Extrae un JSON estricto. 
                    ${CATEGORIES_PROMPT}
                    Formato JSON: {
                        "amount": number,
                        "currency": "ARS",
                        "type": "income"|"expense"|"debt"|"asset",
                        "category": string,
                        "description": string,
                        "is_personal": boolean
                    }`,
        },
        { role: "user", content: text },
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" },
    });

    const financialData = JSON.parse(chatCompletion.choices[0].message.content);

    // --- REGISTRO EN HEDERA ---
    const transactionPayload = {
      ...financialData,
      user_wallet: userWallet,
      timestamp: new Date().toISOString(),
    };

    const transaction = await new TopicMessageSubmitTransaction({
      topicId: process.env.HEDERA_TOPIC_ID,
      message: JSON.stringify(transactionPayload),
    }).execute(client);

    const receipt = await transaction.getReceipt(client);

    res.json({
      success: true,
      data: transactionPayload,
      hedera_sequence: receipt.topicSequenceNumber.toString(),
    });
  } catch (error) {
    console.error("Error en /api/record:", error);
    res
      .status(500)
      .json({ error: "Error procesando registro", details: error.message });
  }
});

// --- LOS OTROS ENDPOINTS (history y stats) ---
app.get("/api/history", async (req, res) => {
  try {
    const response = await axios.get(
      `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages`,
    );
    const messages = response.data.messages.map((m) => ({
      sequence: m.sequence_number,
      data: JSON.parse(Buffer.from(m.message, "base64").toString()),
    }));
    res.json({ success: true, history: messages });
  } catch (e) {
    res.status(500).json({ error: "Error en history" });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const response = await axios.get(
      `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages`,
    );
    const messages = response.data.messages.map((m) =>
      JSON.parse(Buffer.from(m.message, "base64").toString()),
    );
    const stats = {
      total_income: 0,
      total_expense: 0,
      total_debt: 0,
      total_assets: 0,
    };
    messages.forEach((m) => {
      if (m.type === "income") stats.total_income += m.amount;
      if (m.type === "expense") stats.total_expense += m.amount;
    });
    res.json({ success: true, stats });
  } catch (e) {
    res.status(500).json({ error: "Error en stats" });
  }
});

app.listen(3000, () =>
  console.log(`🚀 Servidor FINAI ONG en puerto 3000 (Usando ${AI_MODEL})`),
);
