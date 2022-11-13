import * as fs from 'fs';
import * as http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Chat, Message } from 'types/chat.types';
import { WebSocketServer } from 'ws';
import { User } from 'types/user.types';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import * as url from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const databasePath = `${__dirname}/database.json`;

const chat: Chat = JSON.parse(fs.readFileSync(databasePath).toString());
const messagesLength$: Subject<number> = new Subject();
messagesLength$.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() =>
  fs.writeFile(databasePath, JSON.stringify(chat), (error) => {
    if (error) {
      console.error('An error has occurred while database update: ', error);
      return;
    }
    console.log('Successfull database update');
  })
);

const messagesPerPage: number = 10;

const httpServer = http.createServer(
  (request: http.IncomingMessage, response: http.ServerResponse) => {
    const queryObject: url.Url = url.parse(request.url!, true);
    if (queryObject.pathname === '/messages' && request.method === 'GET') {
      const { oldestMessageId } = queryObject.query as { oldestMessageId: string; };
      const oldestMessageIndex: number = chat.messages.findIndex((value: Message) => value.id === Number(oldestMessageId));
      let targetSlice: Message[];
      if (oldestMessageIndex === 0) {
        targetSlice = [];
      } else if (oldestMessageIndex === -1) {
        targetSlice = chat.messages.slice(-messagesPerPage)
      } else if (oldestMessageIndex <= messagesPerPage) {
        targetSlice = chat.messages.slice(0, messagesPerPage);
      } else {
        targetSlice = chat.messages.slice(oldestMessageIndex - messagesPerPage, oldestMessageIndex);
      }
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(targetSlice));
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
          // in real DB should be incremental ID, instead of random
          let message: Message = {
            id: Math.round(Math.random() * 1_000_000),
            created: Date.now(),
            ...JSON.parse(Buffer.concat(body).toString()),
          };
          chat.messages.push(message);
          messagesLength$.next(chat.messages.length);
          webSocketServer.clients.forEach((client) =>
            client.send(JSON.stringify(message))
          );
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
