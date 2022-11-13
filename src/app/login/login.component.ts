import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoutingPaths } from '../app-routing.module';
import { StorageService } from '../services/storage.service';
import { User } from '../../../types/user.types';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  name: string = '';

  constructor(
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly chatService: ChatService
  ) {}

  join(): void {
    this.chatService.joinChat(this.name).subscribe((user: User) => {
      this.storageService.updateStorage(user);
      this.router.navigate([RoutingPaths.chat]);
    });
  }
}
