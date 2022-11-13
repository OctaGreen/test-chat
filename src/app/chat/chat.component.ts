import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { RoutingPaths } from '../app-routing.module';
import { StorageService } from '../services/storage.service';
import { Message } from '../../../types/chat.types';
import { User } from '../../../types/user.types';
import { ChatService } from '../services/chat.service';
import { Subscription, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chat') chat!: ElementRef;
  @ViewChild('textarea') textarea!: ElementRef;
  messages: Message[] = [];
  private currentUser!: User | null;
  private subscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.subscription = this.storageService
      .getCurrentUser()
      .pipe(
        tap((user: User | null) => {
          if (!user) {
            this.router.navigate([`../${RoutingPaths.login}`]);
          } else {
            this.currentUser = user;
          }
        }),
        switchMap(() => this.chatService.getMessages()),
        tap((messages: Message[]) => {
          this.messages = messages;
          this.chatService.estalishWebSocketConnection();
          this.changeDetector.detectChanges();
        }),
        switchMap(() => this.chatService.getNewMessages())
      )
      .subscribe((message: Message) => {
        console.log('WS RECEIVED:', message);
        this.messages.push(message);
        setTimeout(() => (this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight));
        this.changeDetector.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    this.textarea.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  isUserMessage(uuid: number): boolean {
    return this.storageService.isCurrentUser(uuid);
  }

  sendMessage(message: string): void {
    this.chatService
      .postMessage({ text: message, ...this.currentUser })
      .subscribe(() => {
        this.textarea.nativeElement.value = '';
        this.changeDetector.detectChanges();
      });
  }
}
