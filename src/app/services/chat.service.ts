import { HttpClient, HttpHeaders, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Message } from 'types/chat.types';
import { User } from 'types/user.types';

//todo move to environment.ts
const WEBSOCKET_SERVER_URL = 'ws://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private webSocket$?: WebSocketSubject<Message>;

  constructor(private http: HttpClient) {}

  estalishWebSocketConnection(): void {
    if (!this.webSocket$ || this.webSocket$.closed) {
      this.webSocket$ = new WebSocketSubject({ url: WEBSOCKET_SERVER_URL });
    }
  }

  getNewMessages(): Observable<Message> {
    this.estalishWebSocketConnection();
    return this.webSocket$!.asObservable();
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`/api/messages`);
  }

  getPreviousMessages(oldestMessageId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`/api/messages?oldestMessageId=${oldestMessageId}`);
  }

  joinChat(name: string): Observable<User> {
    return this.http.post<User>(`/api/join`, { name });
  }

  postMessage(message: Partial<Message>): Observable<HttpStatusCode.Ok> {
    return this.http.post<HttpStatusCode.Ok>(`/api/message`, message);
  }
}
