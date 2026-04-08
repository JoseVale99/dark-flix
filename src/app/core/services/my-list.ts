import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiMedia } from '@models';

@Injectable({
  providedIn: 'root'
})
export class MyListService {
  private readonly storageKey = 'df_my_list';
  private platformId = inject(PLATFORM_ID);
  
  public list = signal<ApiMedia[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          this.list.set(JSON.parse(stored));
        } catch {
          this.list.set([]);
        }
      }
      
      // Auto-save effect
      effect(() => {
        localStorage.setItem(this.storageKey, JSON.stringify(this.list()));
      });
    }
  }

  isInList(mediaId: string | number): boolean {
    return this.list().some(m => m._id === mediaId);
  }

  toggleList(media: ApiMedia): void {
    const isPresent = this.isInList(media._id);
    if (isPresent) {
      this.list.update(items => items.filter(m => m._id !== media._id));
    } else {
      this.list.update(items => [media, ...items]);
    }
  }
}
