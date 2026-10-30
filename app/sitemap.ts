import type { MetadataRoute } from 'next';
import { getSitemapEntries } from '@/lib/queries';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

function lastModified(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { anime, makers } = await getSitemapEntries();

  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/anime'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/maker'), changeFrequency: 'weekly', priority: 0.6 },
    ...anime.map((item) => ({
      url: absoluteUrl(`/anime/${item.id}`),
      lastModified: lastModified(item.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...makers.map((id) => ({
      url: absoluteUrl(`/maker/${id}`),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
