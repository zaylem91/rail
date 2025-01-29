import express from "express";
import axios from "axios";
import cors from "cors";
import fs from "fs";
import https from "https";

const app = express();
app.use(express.json());
app.use(cors());

const clientCert = process.env.CLIENT_CERT ? Buffer.from(process.env.CLIENT_CERT, "base64").toString("utf8") : null;
const clientKey = process.env.CLIENT_KEY ? Buffer.from(process.env.CLIENT_KEY, "base64").toString("utf8") : null;

const agent = new https.Agent({
  rejectUnauthorized: false,
  cert: clientCert,
  key: clientKey,
});

// Proxy route
app.post("/proxy", async (req, res) => {
  try {
    const targetUrl = "https://41.137.246.219:8446/ONCF_Proxy_Client_Gateway/ProxyService.svc/rest/AddCampagne";

    const response = await axios.post(targetUrl, req.body, {
      httpsAgent: agent,
      headers: {
        "X-Client-Certificate": clientCert,
        "X-Client-Certificate-Password": process.env.CLIENT_CERT_PASS,
        "X-Client-Certificate-CN": "MarketingAuto",
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
