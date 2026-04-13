import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService, DfProfile } from '@services/profile';
import { PROFILE_ICON_PATHS, PROFILE_ICON_KEYS, ProfileIconKey } from '@core/models/profile-icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'df-profiles-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <!-- Background atmosphere -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.08)_0%,transparent_70%)] pointer-events-none"></div>

      <!-- Header: Logo PNG -->
      <div class="absolute top-0 left-0 w-full p-5 md:p-8 flex items-center justify-between z-200">
        <img src="images/logo/dark-flix.png" class="h-8 md:h-12 object-contain" alt="DarkFlix">
      </div>

      @if (!editMode()) {
        <!-- ── SELECCIÓN DE PERFIL ── -->
        <div class="flex flex-col items-center gap-12 animate-fade-in mt-12">
          <div class="text-center">
            <h1 class="text-white text-3xl md:text-5xl font-black tracking-tight mb-2">¿Quién está viendo?</h1>
            <p class="text-gray-500 text-sm md:text-base">Selecciona tu perfil para continuar</p>
          </div>

          <div class="flex flex-wrap justify-center gap-6 md:gap-10 max-w-2xl">
            @for (profile of profileService.profiles(); track profile.id) {
              @let isActive = profileService.activeProfile()?.id === profile.id;
              <button (click)="selectProfile(profile)" class="group flex flex-col items-center gap-3 cursor-pointer">
                <div class="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center
                            transition-all duration-300 shadow-2xl"
                     [class.ring-[6px]]="isActive"
                     [class.ring-white]="isActive"
                     [class.scale-110]="isActive"
                     [class.border-transparent]="!isActive"
                     [class.group-hover:ring-2]="!isActive"
                     [class.group-hover:ring-white/50]="!isActive"
                     [class.group-hover:scale-105]="!isActive"
                     [style.background-color]="isActive ? profile.color + '66' : profile.color + '22'">
                  <svg viewBox="0 0 256 256" class="w-12 h-12 md:w-16 md:h-16 transition-all duration-300"
                       [style.fill]="isActive ? '#ffffff' : profile.color">
                    <path [attr.d]="getIconPath(profile.avatar)" />
                  </svg>
                </div>
                <span class="font-bold text-sm md:text-base transition-colors max-w-24 md:max-w-32 text-center leading-tight truncate px-1"
                      [class.text-white]="isActive"
                      [class.text-gray-400]="!isActive"
                      [class.group-hover:text-white]="!isActive">
                  {{ profile.name }}
                </span>
              </button>
            }

            <!-- Añadir Perfil (máx 4) -->
            @if (profileService.profiles().length < 4) {
              <button (click)="editMode.set('add')" class="group flex flex-col items-center gap-3 cursor-pointer">
                <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-dashed border-white/20
                            hover:border-white/60 group-hover:scale-105 transition-all duration-200
                            flex items-center justify-center">
                  <svg viewBox="0 0 256 256" class="w-10 h-10 fill-white/30 group-hover:fill-white/70 transition-colors duration-200">
                    <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
                  </svg>
                </div>
                <span class="text-gray-500 group-hover:text-white font-semibold text-sm transition-colors">Añadir perfil</span>
              </button>
            }
          </div>

          <button (click)="editMode.set('manage')"
                  class="border border-white/30 hover:border-white text-white/60 hover:text-white font-bold
                         px-8 py-3 rounded text-sm tracking-widest uppercase transition-all cursor-pointer">
            Gestionar Perfiles
          </button>
        </div>

      } @else if (editMode() === 'manage') {
        <!-- ── GESTIONAR PERFILES ── -->
        <div class="flex flex-col items-center gap-8 w-full max-w-lg animate-fade-in">
          <h2 class="text-white text-2xl md:text-4xl font-black tracking-tight w-full">Gestionar Perfiles</h2>

          <div class="flex flex-col gap-3 w-full">
            @for (profile of profileService.profiles(); track profile.id) {
              <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-3 min-w-0">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                     [style.background-color]="profile.color + '33'">
                  <svg viewBox="0 0 256 256" class="w-6 h-6" [style.fill]="profile.color">
                    <path [attr.d]="getIconPath(profile.avatar)" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-bold truncate text-sm">{{ profile.name }}</p>
                  @if (profileService.activeProfile()?.id === profile.id) {
                    <p class="text-[10px] font-semibold" [style.color]="profile.color">Perfil activo</p>
                  }
                </div>
                <div class="flex gap-1.5 shrink-0">
                  <button (click)="startEdit(profile)"
                          class="text-gray-400 hover:text-white transition-colors text-xs border border-white/20 hover:border-white px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap">
                    Editar
                  </button>
                  @if (profileService.profiles().length > 1) {
                    <button (click)="profileService.deleteProfile(profile.id)"
                            class="text-gray-400 hover:text-[#e50914] transition-colors border border-white/10 hover:border-[#e50914]/50 px-2.5 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap">
                      Borrar
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <button (click)="editMode.set(null)"
                  class="border border-white/30 hover:border-white text-white/60 hover:text-white font-bold
                         px-8 py-3 rounded text-sm tracking-widest uppercase transition-all cursor-pointer">
            Hecho
          </button>
        </div>

      } @else if (editMode() === 'add' || editMode() === 'edit') {
        <!-- ── AÑADIR / EDITAR PERFIL ── -->
        <div class="flex flex-col items-center gap-8 w-full max-w-md animate-fade-in">
          <div class="text-center w-full">
            <h2 class="text-white text-2xl md:text-4xl font-black tracking-tight">
              {{ editMode() === 'add' ? 'Nuevo Perfil' : 'Editar Perfil' }}
            </h2>
            <p class="text-gray-500 text-sm mt-1">Personaliza tu experiencia</p>
          </div>

          <!-- Preview Avatar -->
          <div class="w-28 h-28 rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-2xl"
               [style.background-color]="selectedColor() + '33'">
            <svg viewBox="0 0 256 256" class="w-16 h-16" [style.fill]="selectedColor()">
              <path [attr.d]="getIconPath(selectedAvatar())" />
            </svg>
          </div>

          <!-- Nombre -->
          <div class="w-full">
            <label class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 block">Nombre</label>
            <input [(ngModel)]="editName" maxlength="18" placeholder="Nombre del perfil"
                   class="w-full bg-white/10 border border-white/20 focus:border-white text-white placeholder-gray-500
                          font-bold py-3 px-4 rounded-lg outline-none transition-colors text-lg">
          </div>

          <!-- Selección de Icono -->
          <div class="w-full">
            <label class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 block">Icono</label>
            <div class="grid grid-cols-6 gap-2">
              @for (key of iconKeys; track key) {
                <button (click)="selectedAvatar.set(key)"
                        [class.ring-2]="selectedAvatar() === key"
                        [class.ring-white]="selectedAvatar() === key"
                        [style.background-color]="selectedAvatar() === key ? selectedColor() + '44' : 'rgba(255,255,255,0.07)'"
                        class="aspect-square rounded-xl flex items-center justify-center hover:bg-white/15 transition-all cursor-pointer p-2.5">
                  <svg viewBox="0 0 256 256" class="w-full h-full" [style.fill]="selectedAvatar() === key ? selectedColor() : '#9ca3af'">
                    <path [attr.d]="getIconPath(key)" />
                  </svg>
                </button>
              }
            </div>
          </div>

          <!-- Selección de Color -->
          <div class="w-full">
            <label class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 block">Color</label>
            <div class="flex gap-3 flex-wrap">
              @for (color of colors; track color) {
                <button (click)="selectedColor.set(color)"
                        [class.ring-2]="selectedColor() === color"
                        [class.ring-white]="selectedColor() === color"
                        class="w-9 h-9 rounded-full transition-all cursor-pointer hover:scale-110 border-2 border-transparent"
                        [style.background-color]="color">
                </button>
              }
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex gap-4 w-full">
            <button (click)="cancelEdit()"
                    class="flex-1 border border-white/30 hover:border-white text-white/60 hover:text-white font-bold py-3 rounded transition-all cursor-pointer">
              Cancelar
            </button>
            <button (click)="saveProfile()"
                    class="flex-1 bg-white text-black font-black py-3 rounded hover:bg-gray-200 transition-all cursor-pointer">
              {{ editMode() === 'add' ? 'Crear' : 'Guardar' }}
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfilesViewComponent {
  public profileService = inject(ProfileService);
  private router = inject(Router);

  editMode   = signal<null | 'manage' | 'add' | 'edit'>(null);
  editingId  = signal<string | null>(null);

  // Form state
  editName       = '';
  selectedAvatar = signal<ProfileIconKey>('cinema');
  selectedColor  = signal('#e50914');

  iconKeys = PROFILE_ICON_KEYS;
  colors   = ProfileService.COLORS;

  getIconPath(key: string): string {
    return PROFILE_ICON_PATHS[key as ProfileIconKey] ?? PROFILE_ICON_PATHS['user'];
  }

  selectProfile(profile: DfProfile): void {
    this.profileService.selectProfile(profile);
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  startEdit(profile: DfProfile): void {
    this.editingId.set(profile.id);
    this.editName = profile.name;
    this.selectedAvatar.set(profile.avatar);
    this.selectedColor.set(profile.color);
    this.editMode.set('edit');
  }

  cancelEdit(): void {
    this.editName = '';
    this.editingId.set(null);
    this.editMode.set('manage');
  }

  saveProfile(): void {
    if (this.editMode() === 'add') {
      this.profileService.addProfile(this.editName, this.selectedAvatar(), this.selectedColor());
    } else if (this.editMode() === 'edit' && this.editingId()) {
      this.profileService.updateProfile(this.editingId()!, {
        name:   this.editName,
        avatar: this.selectedAvatar(),
        color:  this.selectedColor(),
      });
    }
    this.editMode.set('manage');
    this.editName = '';
    this.editingId.set(null);
  }
}
