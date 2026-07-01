import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-header">
      <div class="logo">⛽</div>
      <div>
        <div class="title">Nandha Agencies - HP</div>
        <div class="subtitle">Daily Fuel Sales Management</div>
      </div>
    </div>
    <nav class="nav">
      <a routerLink="/entry" routerLinkActive="active">Daily Entry</a>
      <a routerLink="/reports" routerLinkActive="active">Reports</a>
      <a routerLink="/monthly" routerLinkActive="active">Monthly Data</a>
      <a routerLink="/customers" routerLinkActive="active">Customers</a>
      <a routerLink="/prices" routerLinkActive="active">Price Settings</a>
    </nav>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
