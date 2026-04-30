import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import app from "./api/app.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.includes('.')) return next();
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else next();
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false }));
      app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) return next();
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) res.sendFile(indexPath);
        else next();
      });
    } else {
      app.get('*', (req, res) => {
        if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: "API not found" });
        res.status(404).send("Application not built. Please run 'npm run build'.");
      });
    }
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Startup error:", err);
    process.exit(1);
  });
}

export default app;
