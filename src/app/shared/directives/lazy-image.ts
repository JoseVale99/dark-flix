import { Directive, ElementRef, OnDestroy, inject, input, afterNextRender, effect } from '@angular/core';

@Directive({
  selector: 'img[dfLazyImage]'
})
export class LazyImageDirective implements OnDestroy {
  lazySrc = input.required<string | null>();

  private readonly el = inject(ElementRef<HTMLImageElement>);
  private observer: IntersectionObserver | null = null;
  private hasLoadedOnce = false;

  constructor() {
    // Si la imagen ya cargó la primera vez y el signal 'lazySrc' cambia mágicamente 
    // por navegación, actualizamos el origen en vivo sin esperar intersección.
    effect(() => {
       const newSrc = this.lazySrc();
       if (this.hasLoadedOnce) {
         this.el.nativeElement.src = newSrc ?? '';
       }
    });

    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) {
        // Fallback: asignar directamente
        this.el.nativeElement.src = this.lazySrc() ?? '';
        this.hasLoadedOnce = true;
        return;
      }
      
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.src = this.lazySrc() ?? '';
          this.hasLoadedOnce = true;
          this.observer?.disconnect();
          this.observer = null;
        }
      }, { rootMargin: '50px' });
      
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
