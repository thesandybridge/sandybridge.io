import type Fuse from 'fuse.js';
import type { SearchItem } from './types/search';

let resource: Promise<{ data: SearchItem[]; fuse: Fuse<SearchItem> }> | undefined;

/** Desktop and mobile search share one index download and one Fuse instance. */
export function loadSearch() {
  if (!resource) {
    resource = Promise.all([
      fetch('/api/search').then(response => {
        if (!response.ok) throw new Error('Search is temporarily unavailable');
        return response.json() as Promise<SearchItem[]>;
      }),
      import('fuse.js').then(module => module.default),
    ]).then(([data, FuseClass]) => ({
      data,
      fuse: new FuseClass(data, { keys: ['title', 'description', 'tags'], threshold: 0.3 }),
    })).catch(error => {
      resource = undefined;
      throw error;
    });
  }
  return resource;
}
