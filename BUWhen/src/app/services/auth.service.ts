import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // Mock users for demonstration
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@baliuag.edu.ph',
      name: 'Admin User',
      department: 'Administration',
      role: 'admin'
    },
    {
      id: '2',
      email: 'cite.student@baliuag.edu.ph',
      name: 'John Doe',
      department: 'CITE',
      role: 'student'
    },
    {
      id: '3',
      email: 'nursing.faculty@baliuag.edu.ph',
      name: 'Jane Smith',
      department: 'Nursing',
      role: 'faculty'
    }
  ];

  constructor() {
    this.checkStoredUser();
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; user?: User; message?: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        if (user && credentials.password === 'password123') {
          this.setCurrentUser(user);
          this.storeUser(user);
          observer.next({ success: true, user });
        } else {
          observer.next({ success: false, message: 'Invalid email or password' });
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    localStorage.removeItem('buwhen_user');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  private storeUser(user: User): void {
    localStorage.setItem('buwhen_user', JSON.stringify(user));
  }

  private checkStoredUser(): void {
    const storedUser = localStorage.getItem('buwhen_user');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('buwhen_user');
      }
    }
  }

  canManageEvents(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'faculty';
  }

  canCreateUniversityEvents(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}
