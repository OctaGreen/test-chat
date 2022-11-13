import * as fs from 'fs';
import * as http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Chat, Message } from 'types/chat.types';
import { WebSocketServer } from 'ws';
import { User } from 'types/user.types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const chat: Chat = JSON.parse(fs.readFileSync(`${__dirname}/database.json`).toString());

const httpServer = http.createServer(
  (request: http.IncomingMessage, response: http.ServerResponse) => {
    console.log('request.url', request.url);
    if (request.url === '/messages' && request.method === 'GET') {
      //todo handle param 'oldestMessageId'
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(chat.messages));
    } else if (request.url === '/join' && request.method === 'POST') {
      const body: any = [];
      request
        .on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          let user: Partial<User> = JSON.parse(Buffer.concat(body).toString());
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              uuid: Math.floor(Date.now() * Math.random()),
              name: user.name,
              color: generateDarkColorRgb(),
            })
          );
        });
    } else if (request.url === '/message' && request.method === 'POST') {
      const body: any = [];
      request
        .on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          let message: Partial<Message> = JSON.parse(
            Buffer.concat(body).toString()
          );
          chat.messages.push({ created: Date.now(), ...message } as Message);
          webSocketServer.clients.forEach((client) => client.send(JSON.stringify({ created: Date.now(), ...message })))

          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/plain');
          response.end();
        });
    } else {
      response.statusCode = 404;
      response.end();
    }
  }
);

httpServer.listen(3000, () => {
  console.log('Server started');
});

const webSocketServer = new WebSocketServer({ server: httpServer });

function generateDarkColorRgb() {
  const red = Math.floor((Math.random() * 256) / 2);
  const green = Math.floor((Math.random() * 256) / 2);
  const blue = Math.floor((Math.random() * 256) / 2);
  return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
}
