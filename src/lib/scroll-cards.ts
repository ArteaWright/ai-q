export interface ScrollCard {
  id: string;
  headline: string;
  tagline: string;
  body: string;
}

export const SCROLL_CARDS: ScrollCard[] = [
  {
    id: 'card-1',
    headline: 'Card 1 Headline',
    tagline: 'Card 1 Tagline',
    body: 'Card 1 body content will go here. This is a placeholder that will be updated with actual content.',
  },
  {
    id: 'card-2',
    headline: 'Card 2 Headline',
    tagline: 'Card 2 Tagline',
    body: 'Card 2 body content will go here. This is a placeholder that will be updated with actual content.',
  },
  {
    id: 'card-3',
    headline: 'Card 3 Headline',
    tagline: 'Card 3 Tagline',
    body: 'Card 3 body content will go here. This is a placeholder that will be updated with actual content.',
  },
];
