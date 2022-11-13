import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoutingPaths } from './app-routing.module';
import { StorageService } from './services/storage.service';
import { User } from '../../types/user.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  currentUser$: Observable<User | null> = this.storageService.getCurrentUser();

  constructor(
    private readonly router: Router,
    private readonly storageService: StorageService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  leave(): void {
    this.storageService.clearStorage();
    this.router.navigate([`../${RoutingPaths.login}`]);
    this.changeDetector.detectChanges();
  }
}
