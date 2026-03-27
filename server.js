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
          content: `EEres el contador experto de FINAI ONG. 
Analiza el texto y detecta si es una operación simple o compuesta.

REGLA DE ORO:
1. Si hay un pago diferido, cuotas o crédito:
   - Crea un registro 'debt' por el monto total (El Origen).
   - Crea un segundo registro por el mismo monto describiendo en qué se usó (El Destino: puede ser 'asset' si es algo permanente o 'expense' si es algo que se consume).
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

app.get("/api/stats/by-project", async (req, res) => {
  try {
    const response = await axios.get(
      `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages`
    );

    const messages = response.data.messages.map((m) =>
      JSON.parse(Buffer.from(m.message, "base64").toString())
    );

    const projectStats = {};

    messages.forEach((m) => {
      // Extraemos el nombre del proyecto desde la categoría o descripción
      const project = m.category || "Sin_Proyecto";

      if (!projectStats[project]) {
        projectStats[project] = {
          project,
          total_income: 0,
          total_expense: 0,
          total_debt: 0,
          total_assets: 0,
          balance: 0,
          transactions: 0,
        };
      }

      if (m.type === "income")  projectStats[project].total_income  += m.amount;
      if (m.type === "expense") projectStats[project].total_expense += m.amount;
      if (m.type === "debt")    projectStats[project].total_debt    += m.amount;
      if (m.type === "asset")   projectStats[project].total_assets  += m.amount;

      projectStats[project].balance =
        projectStats[project].total_income - projectStats[project].total_expense;

      projectStats[project].transactions += 1;
    });

    // Convertimos el objeto en array ordenado por balance descendente
    const result = Object.values(projectStats).sort(
      (a, b) => b.balance - a.balance
    );

    res.json({ success: true, by_project: result });
  } catch (e) {
    console.error("Error en /api/stats/by-project:", e);
    res.status(500).json({ error: "Error calculando stats por proyecto" });
  }
});

// --- FILTRAR HISTORIAL POR TIPO ---
app.get("/api/history/by-type", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "Debes proporcionar un tipo (income, expense, debt o asset)" });
    }

    const response = await axios.get(
      `https://testnet.mirrornode.hedera.com/api/v1/topics/${process.env.HEDERA_TOPIC_ID}/messages`
    );

    const filteredMessages = response.data.messages
      .map((m) => {
        try {
          // Intentamos decodificar y parsear el JSON
          const decodedString = Buffer.from(m.message, "base64").toString();
          const jsonData = JSON.parse(decodedString);
          
          return {
            sequence: m.sequence_number,
            timestamp: m.consensus_timestamp,
            data: jsonData,
          };
        } catch (e) {
          // Si el mensaje está corrupto o no es JSON, devolvemos null
          console.warn(`Mensaje corrupto saltado en secuencia: ${m.sequence_number}`);
          return null;
        }
      })
      .filter((m) => 
        m !== null &&             // 1. Que el parseo haya sido exitoso
        m.data &&                 // 2. Que tenga el objeto data
        m.data.type &&            // 3. Que exista el campo type
        m.data.type.toLowerCase() === type.toLowerCase() // 4. Que coincida con el filtro
      );

    res.json({
      success: true,
      count: filteredMessages.length,
      type_filtered: type,
      history: filteredMessages,
    });
  } catch (error) {
    console.error("Error crítico en /api/history/by-type:", error.message);
    res.status(500).json({ error: "Error al filtrar el historial", details: error.message });
  }
});


// --- ENDPOINT PARA EL AGENTE 1 DE MONITOREO DE SALDO ---
app.get("/api/agente/check-balance", async (req, res) => {
  console.log(" ENTRE AL ENDPOINT");

  try {
    // Importación dinámica para compatibilidad con .mjs
    const { agenteSaldo } = await import("./agents/agente1-saldo.mjs");
    
    // Ejecutamos la lógica del agente
    const reporte = await agenteSaldo();

    // Respondemos al Front-End
    res.json({
      success: true,
      ...reporte
    });
  } catch (error) {
    console.error("Error al ejecutar Agente de Saldo:", error);
    res.status(500).json({ 
      success: false, 
      error: "No se pudo obtener el reporte del agente." 
    });
  }
});

app.get("/api/agente/reconstruir-db", async (req, res) => {
  try {
    const { agenteReconstruccion } = await import("./agents/agente2-reconstruccion.mjs");
    
    // Ejecutamos la lógica de recuperación desde la Blockchain
    const resultado = await agenteReconstruccion();

    // Respondemos con el informe de lo recuperado
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error("Error en Agente de Reconstrucción:", error);
    res.status(500).json({ 
      success: false, 
      error: "No se pudo sincronizar con la red de Hedera." 
    });
  }
});


// --- ENDPOINT PARA EL REPORTE DE RENDICIÓN DE CUENTAS ---
app.get("/api/agente/reporte-rendicion", async (req, res) => {
  try {
    const { agenteRendicion } = await import("./agents/agente3-rendicion.mjs");
    
    // Obtenemos fechas de los Query Params si existen
    const { desde, hasta } = req.query;
    
    const reporte = await agenteRendicion(desde, hasta);
    
    res.json({
      success: true,
      data: reporte
    });
  } catch (error) {
    console.error("Error en Agente 3:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al generar el reporte de auditoría." 
    });
  }
});

app.listen(3000, () =>
  console.log(`🚀 Servidor FINAI ONG en puerto 3000 (Usando ${AI_MODEL})`),
);
