import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';
import { MessageRepo } from './db/message.repo';
import { AuthPayload, LoginCredentials, Message, RegisterPayload, WSEvent } from '@common/types';
import { UserRepo } from './db/user.repo';

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
//Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await UserRepo.loginUser(req.body);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
      res.json({ token, user} as AuthPayload);
    }
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await UserRepo.registerUser(req.body);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
      res.json({ token, user } as AuthPayload);
    }
  } catch (err) {
    res.status(500).json( { error: 'Registration failed' });
  }
});


//Message
app.get('/api/messages', async (req, res) => {
  try {
    console.log("Attempt to get messages");
    const messages = await MessageRepo.getAllMessages();

    res.json(messages);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})



//WebSocket routes
wss.on('connection', (ws, req) => {
  const token = new URLSearchParams(req.url?.split('?')[1] || '').get('token');
  if (!token) return ws.close();

  try {
    const decoded = jwt.verify(token, SECRET) as any;
    (ws as any).user = decoded.username;


    console.log(`${decoded.username} connected`);
    //Temporary welcome message
    // ws.send(JSON.stringify({ 
    //   type: 'info', 
    //   message: `Welcome ${decoded.username}`, 
    //   timestamp: new Date()
    // }));



  } catch {
    ws.close();
  }

  ws.on('message', async (message) => {
    // const user = (ws as any).user;
    // const data = JSON.parse(msg.toString());

    // wss.clients.forEach(client => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(JSON.stringify({ user, ...data }));
    //   }
    // });
    try {
      const { event, payload }: WSEvent<any> = JSON.parse(message.toString());
      const user = (ws as any).user;

      switch (event) {
        case 'message:send':
          const newMessage: Partial<Message> = { ...payload };
          const id = (await MessageRepo.insertMessage(newMessage)).toString();

          broadcast('message:receive', { ...newMessage, id } as Message );
          break;
        default:
          console.warn('Unhandled event', event);
      }


    } catch (err) {
      console.error('Invalid message format', err);
    }
  });


  ws.on('close', () => {
    console.log('Client disconnected');
  })

});


function broadcast(event: string, payload: any) {
  const message = JSON.stringify({ event, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  })
}


server.listen(3000, () => console.log('Server running on http://localhost:3000'));
