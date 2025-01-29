import express from "express";
import axios from "axios";
import cors from "cors";
import fs from "fs";
import https from "https";

const app = express();
app.use(express.json());
app.use(cors());

const clientCertBase64 = process.env.CLIENT_CERT;
const clientKeyBase64 = process.env.CLIENT_KEY;
const clientCertPass = process.env.CLIENT_CERT_PASS;

const clientCert = clientCertBase64 ? Buffer.from(clientCertBase64, "base64").toString("utf8") : null;
const clientKey = clientKeyBase64 ? Buffer.from(clientKeyBase64, "base64").toString("utf8") : null;

const agent = new https.Agent({
  rejectUnauthorized: false,  // Ignore SSL errors
  cert: clientCert,
  key: clientKey,
  passphrase: clientCertPass,
});

// Proxy route
app.post("/proxy", async (req, res) => {
  try {
    const targetUrl = "https://41.137.246.219:8446/ONCF_Proxy_Client_Gateway/ProxyService.svc/rest/AddCampagne";

    const response = await axios.post(targetUrl, req.body, {
      httpsAgent: agent,
      headers: {
        "X-Client-Certificate-CN": "MarketingAuto",  // Keep only simple headers
        "Content-Type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
