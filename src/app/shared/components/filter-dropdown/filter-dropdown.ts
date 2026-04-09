import { Component, ChangeDetectionStrategy, input, model, computed, signal, ElementRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOption } from '../../../core/constants/filter-config';

@Component({
  selector: 'df-filter-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-w-40 w-full group">
      <!-- Dropdown Toggle Button -->
      <button type="button" 
              (click)="toggle()"
              class="w-full flex items-center justify-between bg-[#191919] border border-white/10 text-gray-300 font-medium text-sm rounded px-4 py-2 hover:bg-white/5 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/20">
        <span>
          {{ title() }} 
          @if (selected().length > 0) {
             <span class="text-xs ml-1 opacity-70 bg-white/20 px-1.5 py-0.5 rounded-full">{{selected().length}}</span>
          }
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" [class.rotate-180]="isOpen()" class="h-4 w-4 ml-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div class="absolute z-50 left-0 top-full mt-2 w-64 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          <!-- Search Box -->
          <div class="p-3 border-b border-white/5">
            <div class="relative">
              <input type="text"
                     [(ngModel)]="searchQuery"
                     [placeholder]="searchPlaceholder()"
                     class="w-full bg-[#111] border border-white/10 text-white text-sm rounded px-3 py-2 pr-8 focus:outline-none focus:border-white/30 placeholder-gray-500"
                     (click)="$event.stopPropagation()">
              @if (searchQuery()) {
                <button (click)="clearSearch($event)" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              }
            </div>
          </div>

          <!-- Options List -->
          <div class="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-1">
            @for (opt of filteredOptions(); track opt.id) {
              <label class="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer rounded transition-colors group/item">
                <div class="relative flex items-center">
                  <input type="checkbox"
                         [checked]="isSelected(opt.id)"
                         (change)="toggleSelection(opt.id, $event)"
                         class="peer opacity-0 absolute h-0 w-0">
                  <div class="h-4 w-4 rounded border border-white/20 bg-transparent flex items-center justify-center peer-focus:ring-2 ring-white/30 peer-checked:bg-white peer-checked:border-white group-hover/item:border-white/50 transition-all">
                    <svg *ngIf="isSelected(opt.id)" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span class="text-sm text-gray-300 group-hover/item:text-white" [class.text-white]="isSelected(opt.id)">
                  {{ opt.name }}
                </span>
              </label>
            }
            
            @if (filteredOptions().length === 0) {
              <div class="px-3 py-4 text-center text-sm text-gray-500">
                No hay resultados
              </div>
            }
          </div>
          
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FilterDropdownComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  title = input.required<string>();
  searchPlaceholder = input<string>('Buscar...');
  options = input.required<FilterOption[]>();

  // Two-way bound model
  selected = model<Array<string|number>>([]);

  // Internal states
  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Computed filtered list
  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter(o => o.name.toLowerCase().includes(q));
  });

  toggle() {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      this.searchQuery.set(''); // Reset search on close
    }
  }

  clearSearch(event: Event) {
    event.stopPropagation();
    this.searchQuery.set('');
  }

  isSelected(id: string | number): boolean {
    return this.selected().some(s => String(s) === String(id));
  }

  toggleSelection(id: string | number, event: Event) {
    event.stopPropagation();
    const current = [...this.selected()];
    const index = current.findIndex(s => String(s) === String(id));
    
    if (index === -1) {
      current.push(id);
    } else {
      current.splice(index, 1);
    }
    
    this.selected.set(current);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Cierra el menu si el usuario hace clic fuera del componente
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchQuery.set('');
    }
  }
}
