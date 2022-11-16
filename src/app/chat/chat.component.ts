import {
  AfterViewInit,
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
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chat') chat!: ElementRef;
  @ViewChild('textarea') textarea!: ElementRef;
  messages: Message[] = [];
  private currentUser!: User | null;
  private subscription?: Subscription;
  private postMessageSubscription?: Subscription;
  private getPreviousMessageSubscription?: Subscription;
  private scrollLoadingTriggered: boolean = false;

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
          this.scrollToBottom();
          this.changeDetector.detectChanges();
        }),
        switchMap(() => this.chatService.getNewMessages())
      )
      .subscribe((message: Message) => {
        this.messages.push(message);
        this.scrollToBottom();
        this.changeDetector.detectChanges();
      }, error => console.error(error));
  }

  ngAfterViewInit(): void {
    this.textarea.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.postMessageSubscription?.unsubscribe();
    this.getPreviousMessageSubscription?.unsubscribe();
  }

  isUserMessage(uuid: number): boolean {
    return this.storageService.isCurrentUser(uuid);
  }

  sendMessage(event: Event): void {
    const message: string = (event.target as HTMLTextAreaElement).value;
    this.postMessageSubscription = this.chatService
      .postMessage({ text: message, ...this.currentUser })
      .subscribe(() => {
        this.textarea.nativeElement.value = '';
        this.changeDetector.detectChanges();
      }, error => console.error(error));
  }

  scrollToBottom(): void {
    setTimeout(() => (this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight));
  }

  //todo add is_first to Message model to prevent redundant requests performing
  onScroll(event: Event): void {
    const scrollTop: number = (event.target as HTMLElement).scrollTop;
    if (scrollTop === 0 && !this.scrollLoadingTriggered) {
      this.scrollLoadingTriggered = true;
      this.getPreviousMessageSubscription = this.chatService.getPreviousMessages(this.messages[0].id).subscribe((messages: Message[]) => {
        this.messages.unshift(...messages);
        this.scrollLoadingTriggered = false;
        this.changeDetector.detectChanges();
      }, error => console.error(error));
    }
  }
}
