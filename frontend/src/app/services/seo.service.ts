import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoTags {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly siteName = 'IndiaHomes';

  constructor(private title: Title, private meta: Meta) {}

  /**
   * Updates the page title and common meta tags.
   */
  updateTags(tags: SeoTags) {
    const fullTitle = `${tags.title} | ${this.siteName}`;
    this.title.setTitle(fullTitle);

    // Standard Meta Tags
    this.meta.updateTag({ name: 'description', content: tags.description });

    // Open Graph (Social Sharing)
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: tags.description });
    
    if (tags.image) {
      this.meta.updateTag({ property: 'og:image', content: tags.image });
    }
    
    if (tags.url) {
      this.meta.updateTag({ property: 'og:url', content: tags.url });
    }

    if (tags.type) {
      this.meta.updateTag({ property: 'og:type', content: tags.type });
    } else {
      this.meta.updateTag({ property: 'og:type', content: 'website' });
    }
  }

  /**
   * Reset to default tags (for home, search, etc.)
   */
  resetDefaultTags() {
    this.updateTags({
      title: 'Real Estate Marketplace',
      description: 'Find your dream home with IndiaHomes. The most trusted platform for buying and renting properties in India.'
    });
  }
}
