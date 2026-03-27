# FINAI ONG — Agente Inteligente de Transparencia Financiera

*FINAI ONG* es una plataforma de gestión financiera diseñada para Organizaciones No Gubernamentales que combina la inmutabilidad de la blockchain *Hedera Hashgraph* con la inteligencia artificial de *Groq (Llama 3.3)* o *OpenAI*. 

El sistema permite registrar movimientos contables mediante lenguaje natural, clasificarlos automáticamente y someterlos a la auditoría en tiempo real de tres agentes especializados.

---

## 🚀 Características Principales

- *Registro en Lenguaje Natural: La IA procesa frases como *"Recibimos una donación de $100.000 de UNICEF" y las convierte en registros contables estructurados.
- *Libro Diario en Blockchain*: Cada transacción se graba de forma inmutable en el servicio de consenso de Hedera (HCS).
- *Sistema de Agentes IA*:
    1. *Guardián de Liquidez*: Analiza el flujo de caja y alerta sobre riesgos de insolvencia.
    2. *Auditor de Anomalías*: Detecta gastos inusuales comparándolos con el historial.
    3. *Estratega de Sostenibilidad*: Proyecta la salud financiera a largo plazo.
- *Transparencia Total*: Sincronización directa con Mirror Nodes de Hedera para auditoría pública.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v18 o superior)
- Una cuenta en [Hedera Portal](https://portal.hedera.com/) (Testnet)
- Una API Key de [Groq Cloud](https://console.groq.com/) o [OpenAI](https://platform.openai.com/).

---

## ⚙️ Configuración del Entorno

1. Clona el repositorio.
2. Crea un archivo .env en la carpeta raíz del backend con los siguientes datos:

```env
# Configuración de Hedera
HEDERA_ACCOUNT_ID=tu_account_id_aqui (ej: 0.0.12345)
HEDERA_PRIVATE_KEY=tu_private_key_hex_aqui
HEDERA_TOPIC_ID=se_generara_en_el_paso_siguiente
UMBRAL_USD=500000 (umbral para agente 1)

# Configuración de IA (Groq o OpenAI)
GROQ_API_KEY=tu_api_key_de_groq
OPENAI_API_KEY=tu_api_key_de_openai (opcional)

🤖 Capa de Inteligencia: Agentes Autónomos (HCS Agents)
El núcleo de FINAI reside en la carpeta /agents. A diferencia de una aplicación tradicional que solo consulta una base de datos, nuestro sistema utiliza Agentes de Inteligencia que razonan sobre el flujo de consenso de Hedera para garantizar transparencia total.

📂 Estructura de la Capa de Agentes
Basado en nuestra arquitectura de micro-servicios lógicos:

agents/agente1-saldo.mjs: Guardián de Liquidez. Analiza el balance en tiempo real y determina el "oxígeno" financiero de la ONG frente a un umbral de seguridad.

agents/agente2-reconstruccion.mjs: Auditor Forense. Procesa el historial del Mirror Node para detectar anomalías y asegurar que los gastos coincidan con el comportamiento histórico.

agents/agente3-rendicion.mjs: Estratega de Sostenibilidad. Compara períodos (Actual vs. Anterior) para proyectar tendencias y recomendar acciones de recaudación.
