export interface LinkClick {
  id: number;
  track_code: string;
  original_url: string;
  ip_address: string | null;
  browser_agent: string | null;
  agent_phone: number | null;
  client_phone: number | null;
  profile_name: string | null;
  clicked_at: string | null;
  conversation_id: string;
  product_id: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  category_id: number | null;
  total_links_generated: number;
  total_recommendations: number;
  links: LinkClick[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Stats {
  total_links_generated: number;
  total_products: number;
  total_categories: number;
  total_recommendations: number;
}

export interface LinkClicksResponse {
  stats: Stats;
  categories: Category[];
  products: Product[];
}
