import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export function qualityClass(quality: string): string {
  const q = quality.toUpperCase();
  if (q.includes('4K') || q.includes('UHD')) return 'bg-purple-700 text-white';
  if (q.includes('HD') || q.includes('1080')) return 'bg-blue-700 text-white';
  if (q.includes('CAM') || q.includes('TS'))  return 'bg-yellow-600 text-black';
  return 'bg-df-card border border-df-border text-df-muted';
}

@Component({
  selector: 'df-badge',
  template: `<span [class]="badgeClasses()">{{ text() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  text = input.required<string>();
  variant = input<'accent' | 'default' | 'quality'>('default');

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded';
    const variants: Record<string, string> = {
      accent:  'bg-df-accent text-white',
      default: 'bg-df-card border border-df-border text-df-muted',
      quality: qualityClass(this.text()),
    };
    return `${base} ${variants[this.variant()]}`;
  });
}
