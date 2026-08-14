export type PersonStatus = 'draft' | 'published';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  person_id: string;
  author: string | null;
  book_title: string | null;
  edition_year: number | null;
  page_number: string | null;
  extra_source: string | null;
  description: string | null;
  created_at: string;
}

export interface PersonImage {
  id: string;
  person_id: string;
  image_url: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  slug: string;
  gender: string | null;
  short_bio: string | null;
  biography: string | null;
  education: string | null;
  positions: string | null;
  works: string | null;
  notable_works: string | null;
  contributions: string | null;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string | null;
  district: string | null;
  profession: string | null;
  title: string | null;
  category_id: string | null;
  profile_image_url: string | null;
  profile_image_path: string | null;
  featured: boolean;
  status: PersonStatus;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  sources?: Source[];
  images?: PersonImage[];
}

export interface SiteSettingsMap {
  about_intro: string;
  about_book: string;
  default_source_author: string;
  default_source_book: string;
  default_source_year: string;
  site_name: string;
  site_tagline: string;
}

export interface PersonFormValues {
  first_name: string;
  last_name: string;
  display_name: string;
  slug: string;
  gender: string;
  short_bio: string;
  biography: string;
  education: string;
  positions: string;
  works: string;
  notable_works: string;
  contributions: string;
  birth_date: string;
  death_date: string;
  birth_place: string;
  district: string;
  profession: string;
  title: string;
  category_id: string;
  featured: boolean;
  status: PersonStatus;
  source_author: string;
  source_book_title: string;
  source_edition_year: string;
  source_page_number: string;
  source_extra: string;
  source_description: string;
}

export interface PersonSearchParams {
  query?: string;
  categorySlug?: string;
  sortAlpha?: boolean;
  page?: number;
  pageSize?: number;
  featuredOnly?: boolean;
  status?: PersonStatus | 'all';
}
