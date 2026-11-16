/**
 * Fuentes internas de video que se suman a hackstore en el reproductor.
 *
 * `apiBase` es una ruta relativa atendida por el proxy:
 *  - desarrollo: `proxy.conf.json`
 *  - producción: rewrite de `vercel.json`
 */
export const LAMOVIE_SOURCE = {
  name: 'LaMovie',
  apiBase: '/lm-api/v1',
  serverPrefix: 'LM',
} as const;
