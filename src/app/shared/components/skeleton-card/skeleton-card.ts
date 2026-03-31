import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'df-skeleton-card',
  template: `
    <div class="aspect-poster w-full rounded bg-linear-to-r from-df-card via-df-surface to-df-card bg-size-[200%_100%] animate-shimmer"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCardComponent {}
