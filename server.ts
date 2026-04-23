import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check/Process Payment
  app.post("/api/checkout", (req, res) => {
    const { items, paymentInfo } = req.body;
    
    // Simulating a high-end processing delay
    setTimeout(() => {
      // Basic validation simulation
      if (paymentInfo?.cardNumber === "4242424242424242") {
         res.json({ 
          success: true, 
          orderId: `EVO-${Math.random().toString(36).substring(7).toUpperCase()}`,
          message: "Pago procesado con éxito" 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Tarjeta declinada o inválida" 
        });
      }
    }, 2000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EVOCARELAB Server running on http://localhost:${PORT}`);
  });
}

startServer();
