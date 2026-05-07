import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="min-vh-100 mt-5 pt-3">
      <router-outlet></router-outlet>
    </main>
    @if (isHome) {
      <app-footer></app-footer>
    }
  `
})
export class AppComponent implements OnInit {
  title = 'india-homes';
  isHome = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHome = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '' || event.urlAfterRedirects.startsWith('/?');
    });
  }
}
