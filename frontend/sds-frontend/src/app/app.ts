import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './layout/components/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'SSA-SDS';
  showNavbar = false;

  private router = inject(Router);

  constructor() {
    // La navbar non va mostrata nella pagina di login; viene ricreata dopo il login
    // così rilegge username e notifiche dell'utente corrente.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.showNavbar = !e.urlAfterRedirects.startsWith('/login'));
  }
}
