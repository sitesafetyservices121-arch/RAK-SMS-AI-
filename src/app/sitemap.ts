import { MetadataRoute } from 'next';

const staticRoutes = [
  '',
  '/dashboard',
  '/documents',
  '/generated-documents',
  '/news',
  '/how-to-guide',
  '/employee-training-tracker',
  '/storeroom-tracker',
  '/site-resource-tracker',
  '/vehicle-inspection-tracker',
  '/ppe-issue-register',
  '/toolbox-talks',
  '/sds-management',
  '/she-plan-generator',
  '/hira-generator',
  '/safe-work-procedure',
  '/method-statement',
  '/ltir-analysis',
  '/ohs-consultant',
  '/account/settings',
  '/account/billing',
  '/account/billing/top-up',
  '/support',
  '/admin',
  '/admin/onboarding',
  '/admin/prescription-management',
  '/admin/billing',
  '/admin/document-upload',
  '/admin/create-news',
  '/admin/wilson-training',
  '/admin/model-inspector',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `https://raksms.services${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return sitemapEntries;
}
