import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../types/user.types';

const STORAGE_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private currentUser$: BehaviorSubject<User | null> = new BehaviorSubject(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'));

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    updateStorage(user: User): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
    }

    clearStorage(): void {
        localStorage.clear();
        this.currentUser$.next(null);
    }

    isCurrentUser(uuid: number): boolean {
        return uuid === this.currentUser$.getValue()?.uuid;
    }
}
