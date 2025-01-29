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
  rejectUnauthorized: false, // Ignore self-signed SSL issues
  cert: clientCertPem,
  key: clientKeyPem,
  passphrase: clientCertPass,
  minVersion: "TLSv1.2", // Force TLS 1.2+
});

// **DYNAMIC ROUTE for ONCF API**
app.post("/:apiEndpoint", async (req, res) => {
  try {
    // Extract API endpoint from URL
    const { apiEndpoint } = req.params;
    
    // Construct the target ONCF API URL
    const targetUrl = `https://41.137.246.219:8446/ONCF_Proxy_Client_Gateway/ProxyService.svc/rest/${apiEndpoint}`;

    console.log(`🔗 Forwarding request to: ${targetUrl}`);
    console.log("📨 Request Body:", JSON.stringify(req.body, null, 2));

    const response = await axios.post(targetUrl, req.body, {
      httpsAgent: agent,
      headers: {
        "X-Client-Certificate-CN": "MarketingAuto",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Response Data:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error:", error.message, error.response?.data);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
