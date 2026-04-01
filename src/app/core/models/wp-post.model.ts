import type { WpMedia } from './wp-media.model';
import type { WpTerm } from './wp-term.model';

export interface WpPost {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  meta: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia': WpMedia[];
    'wp:term': WpTerm[][];
  };
}
