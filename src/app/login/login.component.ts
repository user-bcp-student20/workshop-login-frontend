import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ERROR_MESSAGES, Preferences } from '../models';
import { PreferencesService } from './preferences.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string | null | undefined = '';
  password: string | null | undefined = '';
  busy = false;
  message = '';
  preferences: Preferences;

  constructor(private router: Router, private auth: AuthService, private preferenceStore: PreferencesService) {
    this.preferences = this.preferenceStore.read();
  }

  async login(): Promise<void> {
    this.message = '';
    if (!this.username?.trim()) {
      this.message = 'Ingrese un usuario.';
      return;
    }
    if (!this.password?.trim()) {
      this.message = 'Ingrese una contraseña.';
      return;
    }
    this.busy = true;
    try {
      const login = await this.auth.login({ username: this.username, password: this.password });
      if (login.ok === false) {
        this.message = ERROR_MESSAGES[login.error];
        return;
      }
      const saved = this.preferenceStore.save(this.preferences);
      if (saved.ok === false) {
        this.auth.logout();
        this.message = ERROR_MESSAGES[saved.error];
        return;
      }
      await this.router.navigate(['/dashboard']);
    } catch {
      this.auth.logout();
      this.message = ERROR_MESSAGES.navigation;
    } finally {
      this.busy = false;
    }
  }
}
