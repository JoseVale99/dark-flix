import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'df-skeleton-card',
  template: `
    <div class="aspect-poster w-full rounded-xl bg-linear-to-r from-[#18181b] via-[#27272a] to-[#18181b] bg-size-[200%_100%] animate-shimmer ring-1 ring-white/5"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCardComponent {}
