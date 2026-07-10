import { apiGet } from '@/lib/api';
import type { LinkClicksResponse } from '@/types/link-clicks';
import LinkClicksClient from './index';

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string; sort?: string; order?: string }>;
}

export const metadata = { title: 'Link Click Tracking' };

export default async function LinkClicksPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const queryParams: Record<string, string> = {};
  if (params.category) queryParams.category = params.category;

  const data = await apiGet<LinkClicksResponse>('/link-clicks', queryParams);

  return <LinkClicksClient data={data} filters={params} />;
}
