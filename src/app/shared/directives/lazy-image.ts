import { Directive, ElementRef, OnInit, OnDestroy, inject, input } from '@angular/core';

@Directive({
  selector: 'img[dfLazyImage]'
})
export class LazyImageDirective implements OnInit, OnDestroy {
  lazySrc = input.required<string | null>();

  private readonly el = inject(ElementRef<HTMLImageElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback: asignar directamente
      this.el.nativeElement.src = this.lazySrc() ?? '';
      return;
    }
    
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.el.nativeElement.src = this.lazySrc() ?? '';
        this.observer?.disconnect();
        this.observer = null;
      }
    }, { rootMargin: '50px' });
    
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
