import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SECRET = 'supersecret';

app.use(cors());
app.use(bodyParser.json());

const users = new Map<string, string>();
users.set('testuser', 'password123');
users.set('testuser2', 'password1234')


//API routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (users.get(username) === password) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});


//WebSocket routes
wss.on('connection', (ws, req) => {
  const token = new URLSearchParams(req.url?.split('?')[1] || '').get('token');
  if (!token) return ws.close();

  try {
    const decoded = jwt.verify(token, SECRET) as any;
    (ws as any).user = decoded.username;

    //Temporary welcome message
    ws.send(JSON.stringify({ 
      type: 'info', 
      message: `Welcome ${decoded.username}`, 
      timestamp: new Date()
    }));



  } catch {
    ws.close();
  }

  ws.on('message', (msg) => {
    const user = (ws as any).user;
    const data = JSON.parse(msg.toString());

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ user, ...data }));
      }
    });
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
