import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';
import { MessageRepo } from './db/message.repo';
import { AuthPayload, Message, PresenceUpdate, UserSignature, WSEvent, WSEventType } from '../../common/types';
import { UserRepo } from './db/user.repo';
import { ChannelRepo } from './db/channel.repo';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SECRET = 'supersecret';

app.use(cors());
app.use(bodyParser.json());

//API routes
//Auth
app.post('/api/public/auth/login', async (req, res) => {
  try {
    const user = await UserRepo.loginUser(req.body);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const token = jwt.sign({ id: user.id, username: user.username } as UserSignature, SECRET);
      res.json({ token, user} as AuthPayload);
    }
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/public/auth/register', async (req, res) => {
  try {
    const user = await UserRepo.registerUser(req.body);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const token = jwt.sign({ id: user.id, username: user.username } as UserSignature, SECRET);
      res.json({ token, user } as AuthPayload);
    }
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/private/auth/me', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).signature.id
    const user = await UserRepo.getUserById(userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found'});
    } else {
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

//User
app.get('/api/private/users/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserRepo.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found'});
    } else {
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})


//Servers, Channels, Messages
app.get('/api/private/channels/:channelId/messages', authMiddleware, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    //console.log(`HTTP: Attempt to get messages from channel ${channelId}`);

    const messages = await MessageRepo.getAllChannelMessages(channelId);

    res.json(messages);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

app.get('/api/private/channels', authMiddleware, async (req, res) => {
  try {
    //console.log("HTTP: Attempt to get channels");
    const channels = await ChannelRepo.getChannels();

    res.json(channels);
  } catch (err) {
    console.error('Error getting channels', err);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
})


function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const signature = jwt.verify(token, SECRET);
    req.signature = signature
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}



//WebSocket constants
const clientLastPong: Map<WebSocket, number> = new Map();
const HEARTBEAT_INTERVAL = 30000;
const TIMEOUT_LIMIT = 60000;

//WebSocket routes
wss.on('connection', (ws, req) => {
  const token = new URLSearchParams(req.url?.split('?')[1] || '').get('token');
  if (!token) return ws.close();

  try {
    const signature = jwt.verify(token, SECRET) as any;
    (ws as any).signature = signature.username;

    console.log(`WS: ${signature.username} connected`);

    clientLastPong.set(ws, Date.now());
  } catch {
    ws.close();
  }

  ws.on('message', async (message) => {
    try {
      const { event, payload }: WSEvent<any> = JSON.parse(message.toString());
      const signature: UserSignature = (ws as any).signature;

      switch (event) {
        case 'message:send':
          const newMessage: Partial<Message> = { ...payload };
          const messageId = (await MessageRepo.insertMessage(newMessage)).toString();

          broadcast('message:receive', { ...newMessage, messageId } as Message );
          console.log(`WS: ${signature} sending message`)
          break;
        case 'presence:update':
          const presenceUpdate: Partial<PresenceUpdate> = { ...payload };
          const id = signature.id;

          broadcast('presence:update', { ...presenceUpdate,  id });
          break;
        case 'pong':
          clientLastPong.set(ws, Date.now());
          console.log(`WS: Pong from ${signature}`)
          break;
        default:
          console.warn('WS: Unhandled event', event);
      }
    } catch (err) {
      console.error('WS: Invalid message format', err);
    }
  });


  ws.on('close', () => {
    clientLastPong.delete(ws);
    console.log(`WS: ${(ws as any).signature} disconnected`);
  });

});

setInterval(() => {
  const now = Date.now();
  console.log('WS: Ping');

  console.log(wss.clients.size);

  wss.clients.forEach((ws) => {
    const lastPong = clientLastPong.get(ws) || 0;

    //Remove dead connections
    if (now - lastPong > TIMEOUT_LIMIT) {
      console.log(`WS: No pong received from ${(ws as any).signature} - terminating client`);
      ws.terminate();
      return;
    }
    //Ping
    const ping: WSEvent = { event: WSEventType.PING, payload: { timestamp: now } };
    ws.send(JSON.stringify(ping));
  });
}, HEARTBEAT_INTERVAL);

function broadcast(event: string, payload: any) {
  const message = JSON.stringify({ event, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  })
}


server.listen(3000, () => console.log('Server running on http://localhost:3000'));
