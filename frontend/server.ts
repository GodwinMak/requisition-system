import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import os from "os";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: "0.0.0.0" // This allows Vite to be accessible over the LAN
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Helper to find your Local IP address
  const networkInterfaces = os.networkInterfaces();
  let lanIp = "localhost";
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        lanIp = iface.address;
      }
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`> Local:   http://localhost:${PORT}`);
    console.log(`> Network: http://${lanIp}:${PORT}`);
  });
}

startServer();