import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('usa español por defecto', () => {
    expect(service.lang()).toBe('es');
    expect(service.t('nav.home')).toBe('Inicio');
  });

  it('cambia de idioma y traduce en inglés', () => {
    service.setLang('en');
    expect(service.t('nav.home')).toBe('Home');
    expect(service.mediaTypeLabel('movies')).toBe('Movie');
  });

  it('interpola parámetros', () => {
    expect(service.t('search.noResultsFor', { query: 'batman' })).toBe(
      'Sin resultados para "batman"',
    );
  });

  it('localiza términos de taxonomía por slug con fallback', () => {
    service.setLang('en');
    expect(service.term('genre', 'accion', 'Acción')).toBe('Action');
    expect(service.term('genre', 'desconocido', 'Desconocido')).toBe('Desconocido');
  });

  it('alterna entre español e inglés', () => {
    service.toggleLang();
    expect(service.lang()).toBe('en');
    service.toggleLang();
    expect(service.lang()).toBe('es');
  });
});
