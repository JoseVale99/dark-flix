import { Directive, ElementRef, inject, output, input, HostListener, signal } from '@angular/core';

/**
 * Directive that wraps an iframe and detects loading errors/timeouts.
 * Since we can't access cross-origin iframe content due to CORS, we use a timeout-based approach.
 *
 * Angular 21 features used:
 * - input() / output() signal-based APIs
 * - signal() for reactive state
 * - inject() instead of constructor injection
 * - Standalone is the default in Angular 21 (no standalone property needed)
 */
@Directive({
  selector: 'iframe[dfIframeLoader]',
  host: {
    '[attr.loading]': 'loadingState()'
  }
})
export class IframeLoaderDirective {
  private readonly el = inject(ElementRef<HTMLIFrameElement>);

  /** Timeout in milliseconds before considering the load as failed */
  readonly timeoutMs = input(15_000);

  readonly loadError = output<void>();
  readonly loadSuccess = output<void>();
  readonly loadTimeout = output<void>();

  /** Tracks current loading state: 'loading' | 'success' | 'error' */
  readonly loadingState = signal<'loading' | 'success' | 'error'>('loading');

  private loadTimer: ReturnType<typeof setTimeout> | null = null;
  private hasEmitted = false;

  @HostListener('load')
  onLoad(): void {
    if (this.hasEmitted) return;
    this.hasEmitted = true;
    this.clearTimer();
    this.loadingState.set('success');
    this.loadSuccess.emit();
  }

  @HostListener('error')
  onError(): void {
    if (this.hasEmitted) return;
    this.hasEmitted = true;
    this.clearTimer();
    this.loadingState.set('error');
    this.loadError.emit();
  }

  /** Start (or restart) the timeout timer */
  start(): void {
    this.clearTimer();
    this.hasEmitted = false;
    this.loadingState.set('loading');
    this.loadTimer = setTimeout(() => {
      if (this.loadingState() === 'loading' && !this.hasEmitted) {
        this.hasEmitted = true;
        this.loadingState.set('error');
        this.loadTimeout.emit();
      }
    }, this.timeoutMs());
  }

  /** Manually report an error */
  reportError(): void {
    if (this.hasEmitted) return;
    this.hasEmitted = true;
    this.clearTimer();
    this.loadingState.set('error');
    this.loadError.emit();
  }

  /** Reset state back to loading */
  reset(): void {
    this.start();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.loadTimer !== null) {
      clearTimeout(this.loadTimer);
      this.loadTimer = null;
    }
  }
}
