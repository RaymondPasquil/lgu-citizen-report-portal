// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import fs from 'fs';
import https from 'https';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Replace createServer(...) with HTTPS server if certs exist
    const certPath = process.env.LOCAL_CERT || './localhost+2.pem';
    const keyPath = process.env.LOCAL_KEY || './localhost+2-key.pem';

    const server = (fs.existsSync(certPath) && fs.existsSync(keyPath))
      ? https.createServer({ cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }, (req, res) => { if (req.url?.startsWith('/api/socketio')) return; handle(req, res); })
      : createHttpServer((req, res) => { if (req.url?.startsWith('/api/socketio')) return; handle(req, res); });

    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    server.listen(PORT, HOST, () => {
      const publicHost = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
      console.log(`Ready on ${publicHost}`);
      console.log(`Socket.IO endpoint: ${publicHost.replace(/^http/, 'ws')}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

createCustomServer();
