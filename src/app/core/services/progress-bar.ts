import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProgressBarService {
  readonly visible  = signal(false);
  readonly progress = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;

  start(): void {
    this.visible.set(true);
    this.progress.set(5);
    this.timer = setInterval(() => {
      if (this.progress() < 85) {
        this.progress.update((p) => Math.min(85, p + Math.random() * 8));
      }
    }, 300);
  }

  complete(): void {
    this.clearTimer();
    this.progress.set(100);
    setTimeout(() => {
      this.visible.set(false);
      this.progress.set(0);
    }, 400);
  }

  error(): void {
    this.clearTimer();
    this.visible.set(false);
    this.progress.set(0);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
