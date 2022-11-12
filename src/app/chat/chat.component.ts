import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { RoutingPaths } from '../app-routing.module';
import { StorageService } from '../services/storage.service';
import { Message } from '../types/chat.types';
import { User } from '../types/user.types';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  @ViewChild('chat') chat!: ElementRef;
  @ViewChild('textarea') textarea!: ElementRef;
  currentUser!: User | null;
  messages: Message[] = [
    {
      uuid: 0,
      author: 'System',
      color: 'rgb(238, 235, 235)',
      text: "Welcome to tomoru chat! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      created: Date.now(),
    },
  ];
  // if there is no active backend-section, redirect to login.component

  constructor(
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.storageService.getCurrentUser().subscribe((user: User | null) => {
      if (!user) {
        this.router.navigate([`../${RoutingPaths.login}`]);
      } else {
        this.currentUser = user;
        this.changeDetector.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.textarea.nativeElement.focus();
  }

  isUserMessage(uuid: number) {
    return this.storageService.isCurrentUser(uuid);
  }

  sendMessage(message: string): void {
    this.messages.push({
      uuid: this.currentUser!.uuid,
      author: this.currentUser!.name,
      color: this.currentUser!.color,
      text: message,
      created: Date.now()
    });
    this.textarea.nativeElement.value = '';
    setTimeout(() => this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight);
    this.changeDetector.detectChanges();
  }
}
