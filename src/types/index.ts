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
  view_count?: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  sources?: Source[];
  images?: PersonImage[];
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface BiographySubmission {
  id: string;
  full_name: string;
  email: string | null;
  category_id: string | null;
  profession: string | null;
  birth_place: string | null;
  biography: string;
  notes: string | null;
  photo_url?: string | null;
  photo_path?: string | null;
  status: SubmissionStatus;
  created_at: string;
  category?: Category | null;
}

export interface SiteSettingsMap {
  about_intro: string;
  about_book: string;
  default_source_author: string;
  default_source_book: string;
  default_source_year: string;
  site_name: string;
  site_tagline: string;
  author_profile: string;
  author_books: string;
  columnists: string;
  poems: string;
  news: string;
  interviews: string;
  ads: string;
  content_reactions: string;
  content_comments: string;
  portraits_bg_fixed: string;
}

export type AdSlotId =
  | 'home_after_hero'
  | 'home_mid'
  | 'sidebar'
  | 'content_after'
  | 'footer';

export type AdFormat = 'leaderboard' | 'rectangle' | 'inline';

/** image = tam görsel; brand = site tipografisiyle logo kartı */
export type AdPresentation = 'image' | 'brand';

export interface AdPlacement {
  id: string;
  slot: AdSlotId;
  format: AdFormat;
  enabled: boolean;
  /** true = gerçek reklam; false = satılık alan tanıtımı */
  live: boolean;
  presentation?: AdPresentation;
  headline: string;
  body: string;
  cta: string;
  href: string | null;
  image_url: string | null;
  sponsor: string | null;
  size_label: string;
}

export interface AuthorProfile {
  id: number;
  full_name: string;
  title: string | null;
  short_bio: string | null;
  biography: string | null;
  birth_date: string | null;
  birth_place: string | null;
  photo_url: string | null;
  photo_path: string | null;
  updated_at?: string;
}

export interface AuthorBook {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  publisher: string | null;
  description: string | null;
  cover_url: string | null;
  cover_path: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthorBookFormValues {
  title: string;
  year: string;
  publisher: string;
  description: string;
  published: boolean;
}

export interface ColumnistArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Columnist {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  /** Köşenin adı, örn. HAYAL ÖTESİ */
  column_name: string | null;
  photo_url: string | null;
  photo_path: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  articles: ColumnistArticle[];
}

export interface ColumnistFormValues {
  name: string;
  title: string;
  column_name: string;
  published: boolean;
}

export interface ColumnistArticleFormValues {
  title: string;
  body: string;
  published: boolean;
}

export interface Poem {
  id: string;
  title: string;
  slug: string;
  /** Şair adı; boşsa sitede İsmail Hayal gösterilir */
  poet: string;
  body: string;
  image_url: string | null;
  image_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PoemFormValues {
  title: string;
  poet: string;
  body: string;
  published: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  body: string;
  image_url: string | null;
  image_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsFormValues {
  title: string;
  body: string;
  published: boolean;
}

export interface InterviewItem {
  id: string;
  title: string;
  slug: string;
  body: string;
  guest: string | null;
  image_url: string | null;
  image_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterviewFormValues {
  title: string;
  guest: string;
  body: string;
  published: boolean;
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
  letter?: string;
  sortAlpha?: boolean;
  page?: number;
  pageSize?: number;
  featuredOnly?: boolean;
  status?: PersonStatus | 'all';
}
