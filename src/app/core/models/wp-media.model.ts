export interface WpImageSize {
  source_url: string;
}

export interface WpMedia {
  id: number;
  source_url: string;
  media_details?: {
    sizes?: {
      full?: WpImageSize;
      medium?: WpImageSize;
      thumbnail?: WpImageSize;
    };
  };
}
