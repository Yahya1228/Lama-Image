
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  path: string;
}

export interface SavedImage {
  id: string;
  name: string;
  url: string;
  type: 'compressed' | 'enhanced';
  date: string;
  size?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export type Theme = 'light' | 'dark';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
