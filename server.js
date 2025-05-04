// En haut du fichier
const PORT = process.env.PORT || 3000;

// Remplacez server.listen(...) par :
server.listen(PORT, () => {
  console.log(`✅ Serveur en ligne : http://localhost:${PORT}`);
});
const express = require('express');
const Gun = require('gun');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Configuration Express
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Création serveur HTTP + WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
  server,
  path: '/gun' // Endpoint WebSocket explicite
});

// Configuration GUN.js
const gun = Gun({
  web: server,
  file: 'blockchain-data.json',
  ws: {
    server: wss,
    onConnection: (ws) => {
      ws.on('message', (data) => {
        try {
          gun.on('in', JSON.parse(data));
        } catch (e) {
          console.error('Erreur WebSocket:', e);
        }
      });
    }
  }
});

// Import blockchain
const Blockchain = require('./server/blockchain');
const blockchain = new Blockchain(gun);

// Route de minage
app.post('/mine', async (req, res) => {
  try {
    await blockchain.mineBlock(req.body.spaceMB || 100);
    res.send('✅ Bloc miné !');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Erreur de minage');
  }
});

// Route frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage
server.listen(3000, () => console.log(`
███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
█████╗  █████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
██╔══╝  ██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
███████╗███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
http://localhost:3000
`));