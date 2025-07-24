import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }
  async showComingSoon() {
    const toast = await this.toastController.create({
      message: 'This feature is coming soon!',
      duration: 2000,
      color: 'light',
      position: 'top'
    });
    await toast.present();
  }

  ngOnInit() {
    this.createLoginForm();
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private createLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin() {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const loading = await this.loadingController.create({
        message: 'Logging in...',
        duration: 10000
      });
      await loading.present();

      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: async (result) => {
          await loading.dismiss();
          this.isSubmitting = false;

          if (result.success) {
            this.router.navigate(['/dashboard']);
          } else {
            await this.showAlert('Login Failed', result.message || 'Invalid credentials');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isSubmitting = false;
          await this.showAlert('Error', 'An error occurred during login');
        }
      });
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
