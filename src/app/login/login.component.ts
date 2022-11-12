import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoutingPaths } from '../app-routing.module';
import { StorageService } from '../services/storage.service';
import { User } from '../types/user.types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  name: string = '';

  constructor(private readonly router: Router, private readonly storageService: StorageService) {}

  join(): void {
    //todo start session with backend, on response redirect to chat.component
    let user: User = {
      uuid: Math.floor(Date.now() * Math.random()),
      name: this.name,
      color: this.generateDarkColorRgb()
    }
    this.storageService.updateStorage(user);
    this.router.navigate([RoutingPaths.chat]);
  }

  generateDarkColorRgb() {
    const red = Math.floor(Math.random() * 256/2);
    const green = Math.floor(Math.random() * 256/2);
    const blue = Math.floor(Math.random() * 256/2);
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  }
}
