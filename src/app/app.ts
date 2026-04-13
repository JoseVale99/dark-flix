import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar';
import { ProgressBarService } from '@services/progress-bar';
import { NetworkService } from '@services/network';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav';
import { TopNavComponent } from '@shared/components/top-nav/top-nav';
import { PwaInstallBannerComponent } from '@shared/components/pwa-install-banner/pwa-install-banner';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    ProgressBarComponent,
    BottomNavComponent,
    TopNavComponent,
    PwaInstallBannerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router      = inject(Router);
  private readonly progressSvc = inject(ProgressBarService);
  public readonly networkService = inject(NetworkService);

  public readonly isProfilesPage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0] === '/profiles')
    ),
    { initialValue: typeof window !== 'undefined' && window.location.pathname === '/profiles' }
  );

  constructor() {
    // takeUntilDestroyed() se desuscribe automáticamente cuando
    // el componente se destruye — no necesita ngOnDestroy manual
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        takeUntilDestroyed()
      )
      .subscribe(() => this.progressSvc.start());

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd || e instanceof NavigationError),
        takeUntilDestroyed()
      )
      .subscribe(() => this.progressSvc.complete());

  }
}
