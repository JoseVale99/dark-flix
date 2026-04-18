import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'df-splash-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  },
  template: `
    <div
      class="fixed inset-0 z-10000 flex flex-col items-center justify-center bg-[#0a0a0a] transition-all duration-700 ease-in-out"
      [class.opacity-0]="isReady()"
      [class.pointer-events-none]="isReady()">

      <!-- Container for logo and spinner with push out transition -->
      <div class="flex flex-col items-center gap-8 transition-all duration-700 ease-out"
           [class.scale-110]="isReady()"
           [class.opacity-0]="isReady()"
           [class.blur-md]="isReady()"
           [class.scale-100]="!isReady()"
           [class.opacity-100]="!isReady()"
           [class.blur-0]="!isReady()">

        <!-- Logo with subtle breathing animation using Tailwind arbitrary values -->
        <div class="relative animate-[pulse_3s_ease-in-out_infinite]">
          <img src="/images/logo/dark-flix.png" alt="DarkFlix" class="h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(229,9,20,0.4)]" />
        </div>

        <!-- Premium modern spinner -->
        <div class="relative w-12 h-12 flex items-center justify-center">
           <svg class="animate-spin h-10 w-10 text-[#e50914]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
             <path class="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      </div>
    </div>
  `
})
export class SplashScreenComponent {
  /** When true, the splash screen initiates its fade-out sequence */
  public readonly isReady = input<boolean>(false);
}
