import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://getroastlab.vercel.app';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/analyze`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/dashboard/reports`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/dashboard/billing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/sign-in`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/sign-up`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
