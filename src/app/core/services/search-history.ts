import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly storageKey = 'df_search_history';
  private readonly maxItems = 8;
  private platformId = inject(PLATFORM_ID);

  public history = signal<string[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try { this.history.set(JSON.parse(stored)); } catch { this.history.set([]); }
      }
    }
  }

  add(query: string): void {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    this.history.update(h => {
      const filtered = h.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, this.maxItems);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  remove(query: string): void {
    this.history.update(h => {
      const next = h.filter(q => q !== query);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  clear(): void {
    this.history.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }
  }
}
