import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiMedia } from '@models';

@Injectable({
  providedIn: 'root'
})
export class WatchHistoryService {
  private readonly storageKey = 'df_watch_history';
  private readonly maxItems = 25;
  private platformId = inject(PLATFORM_ID);
  
  public history = signal<ApiMedia[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          this.history.set(JSON.parse(stored));
        } catch {
          this.history.set([]);
        }
      }
      
      // Auto-save effect
      effect(() => {
        localStorage.setItem(this.storageKey, JSON.stringify(this.history()));
      });
    }
  }

  addToHistory(media: ApiMedia): void {
    if (!media || !media._id) return;
    
    this.history.update(currentHistory => {
      // Remove it if it already exists to move it to the top
      const filtered = currentHistory.filter(m => m._id !== media._id);
      
      // Add standard media to the front
      const newHistory = [media, ...filtered];
      
      // Truncate to keep performance
      return newHistory.slice(0, this.maxItems);
    });
  }
  
  clearHistory(): void {
    this.history.set([]);
  }
}
