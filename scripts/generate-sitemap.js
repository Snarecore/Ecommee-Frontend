import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

(async () => {
  const sitemap = new SitemapStream({ hostname: 'https://fashiontime.com' });
  const writeStream = createWriteStream('./public/sitemap.xml');
  sitemap.pipe(writeStream);

  const EXCLUDED = new Set([
    '/login',
    '/signup',
    '/vendor-signup',
    '/forgot-password',
    '/wishlist',
    '/cart',
    '/checkout',
    '/account',
    '/orders',
    '/profile',
    '/search',
  ]);


  const STATIC_ROUTES = [
    '/',                    // homepage
    '/shop',
    '/all-categories',
    '/contact-us',
    '/about-us',
    '/faqs',
    '/services',
    '/blog',
  ];

  const POLICY_ROUTES = [
    '/privacy-policy',
    '/terms-conditions',
    '/exchange-policy',
    '/accessibility',
    '/community-guideline',
    '/community-ip-policy',
    '/refund-return-policy',
    '/shipping-delivery-policy',
    '/vendor-agreement',
  ];

  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });

  STATIC_ROUTES.forEach((url) => {
    if (!EXCLUDED.has(url) && url !== '/') {
      sitemap.write({ url, changefreq: 'weekly', priority: 0.8 });
    }
  });

  POLICY_ROUTES.forEach((url) => {
    if (!EXCLUDED.has(url)) {
      sitemap.write({ url, changefreq: 'yearly', priority: 0.4 });
    }
  });

  sitemap.end();
  await streamToPromise(sitemap);

  // console.log('✅ Sitemap generated at public/sitemap.xml');
})();
