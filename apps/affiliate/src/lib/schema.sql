create extension if not exists "pgcrypto";

create table if not exists affiliate_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null unique,
  alias_domains text[] not null default '{}',
  locale text not null default 'en-US',
  country text not null default 'US',
  currency text not null default 'USD',
  description text not null default '',
  logo_url text,
  theme_color text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table affiliate_sites
  add column if not exists alias_domains text[] not null default '{}',
  add column if not exists logo_url text,
  add column if not exists theme_color text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

create table if not exists affiliate_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references affiliate_sites(id) on delete cascade,
  parent_id uuid references affiliate_categories(id) on delete set null,
  nav_section text not null default 'categories',
  name text not null,
  slug text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(site_id, slug)
);

create table if not exists affiliate_products (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references affiliate_sites(id) on delete cascade,
  category_id uuid references affiliate_categories(id) on delete set null,
  title text not null,
  slug text not null,
  description text not null default '',
  image_url text,
  platform text not null,
  platform_title text not null,
  country text not null default 'US',
  price_text text not null default '',
  affiliate_url text not null,
  affiliate_id text,
  account_user text,
  creator_username text,
  status text not null default 'draft',
  view_count integer not null default 0,
  click_count integer not null default 0,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(site_id, slug)
);

create table if not exists affiliate_blog_posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references affiliate_sites(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text not null default '',
  status text not null default 'draft',
  seo_title text,
  seo_description text,
  source_title text,
  source_url text,
  source_author text,
  source_license text,
  source_license_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(site_id, slug)
);

alter table affiliate_blog_posts
  add column if not exists source_title text,
  add column if not exists source_url text,
  add column if not exists source_author text,
  add column if not exists source_license text,
  add column if not exists source_license_url text;

create table if not exists affiliate_collector_runs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references affiliate_sites(id) on delete cascade,
  blog_post_id uuid references affiliate_blog_posts(id) on delete set null,
  source_url text not null,
  status text not null default 'rejected',
  message text not null default '',
  title text not null default '',
  author text not null default '',
  license text not null default '',
  license_url text not null default '',
  word_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_click_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references affiliate_products(id) on delete cascade,
  click_id text not null,
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_products_site_status_idx
  on affiliate_products(site_id, status);

create index if not exists affiliate_blog_posts_site_status_idx
  on affiliate_blog_posts(site_id, status);

create index if not exists affiliate_collector_runs_site_created_idx
  on affiliate_collector_runs(site_id, created_at desc);

create index if not exists affiliate_click_events_product_created_idx
  on affiliate_click_events(product_id, created_at desc);
