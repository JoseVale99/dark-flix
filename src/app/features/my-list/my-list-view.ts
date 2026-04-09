import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MyListService } from '@services/my-list';
import { MediaGridComponent } from '@shared/components/media-grid/media-grid';
import { ApiMedia } from '@models';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

@Component({
  selector: 'df-my-list-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MediaGridComponent],
  providers: [MediaUrlPipe],
  template: `
    <div class="max-w-400 mx-auto px-4 md:px-8 pt-8 pb-24 md:mt-8 min-h-[70vh]">
      <h1 class="text-3xl md:text-5xl font-black mb-12 flex items-center gap-3 border-b border-white/10 pb-6 uppercase tracking-wider">
        Mi Lista
      </h1>

      @if (myListService.list().length === 0) {
        <div class="text-center py-20 flex flex-col items-center justify-center h-[40vh] bg-white/5 rounded-xl border border-white/10">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-700 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
           <h2 class="text-2xl md:text-3xl font-bold text-gray-400 mb-2">Aún no has guardado nada</h2>
           <p class="text-gray-500 mb-8 max-w-md">Agrega películas y series a tu lista para asegurar no perder de vista aquellas con las que te quieres emocionar más tarde.</p>
           <button (click)="goHome()" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 px-8 rounded transition-colors cursor-pointer flex items-center gap-2">
             Explorar Catálogo
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
             </svg>
           </button>
        </div>
      } @else {
        <df-media-grid 
          [title]="''" 
          [mediaItems]="myListService.list()" 
          (mediaSelected)="onMediaSelected($event)" />
      }
    </div>
  `
})
export class MyListViewComponent {
  public myListService = inject(MyListService);
  private router = inject(Router);
  private mediaUrlPipe = inject(MediaUrlPipe);

  onMediaSelected(media: ApiMedia) {
    const url = this.mediaUrlPipe.transform(media);
    const segments = url.split('/').filter(s => s !== '');
    this.router.navigate(['/', ...segments], { state: { media } });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
