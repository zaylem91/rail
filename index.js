import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Disable SSL verification globally
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Proxy route
app.post("/proxy", async (req, res) => {
  try {
    const targetUrl = "https://41.137.246.219:8446/ONCF_Proxy_Client_Gateway/ProxyService.svc/rest/AddCampagne";

    const response = await axios.post(targetUrl, req.body, {
      headers: {
        "X-Client-Certificate": process.env.CLIENT_CERT, 
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));

