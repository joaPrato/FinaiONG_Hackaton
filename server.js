require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey,
} = require("@hashgraph/sdk");

const app = express();
app.use(cors()); // Importante para que el frontend pueda hablar con el backend
app.use(express.json());

const client = Client.forTestnet();
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
client.setOperator(process.env.HEDERA_ACCOUNT_ID, operatorKey);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/record", async (req, res) => {
  const { text, userWallet } = req.body; // Recibimos el texto y el ID de la billetera conectada
  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract financial JSON from text." },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    const financialData = JSON.parse(aiResponse.choices[0].message.content);

    // Guardamos en Hedera incluyendo el ID de la billetera del usuario
    await new TopicMessageSubmitTransaction({
      topicId: process.env.HEDERA_TOPIC_ID,
      message: JSON.stringify({
        ...financialData,
        userWallet,
        timestamp: new Date(),
      }),
    }).execute(client);

    res.json({ success: true, data: financialData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log("Backend en puerto 3001"));
