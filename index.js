import express from "express";
import axios from "axios";
import cors from "cors";
import https from "https";

const app = express();
app.use(express.json());
app.use(cors());

// Decode Base64 environment variables
const clientCertPem = process.env.CLIENT_CERT_PEM
  ? Buffer.from(process.env.CLIENT_CERT_PEM, "base64").toString("utf8")
  : null;

const clientKeyPem = process.env.CLIENT_KEY_PEM
  ? Buffer.from(process.env.CLIENT_KEY_PEM, "base64").toString("utf8")
  : null;

const clientCertPass = process.env.CLIENT_CERT_PASS || "";

// Create HTTPS agent
const agent = new https.Agent({
  rejectUnauthorized: false,  // Ignore SSL errors
  cert: clientCertPem,
  key: clientKeyPem,
  passphrase: clientCertPass,
});

// Proxy route
app.post("/proxy", async (req, res) => {
  try {
    const targetUrl =
      "https://41.137.246.219:8446/ONCF_Proxy_Client_Gateway/ProxyService.svc/rest/AddCampagne";

    const response = await axios.post(targetUrl, req.body, {
      httpsAgent: agent,
      headers: {
        "X-Client-Certificate-CN": "MarketingAuto",  // Remove PEM headers
        "Content-Type": "application/json",
      },
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
