/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://cashduezy.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/dashboard/*'], // don’t index private dashboard routes
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/dashboard'] },
    ],
  },
  additionalPaths: async (config) => [
    // Explicitly include important public pages
    await config.transform(config, '/faq'),
    await config.transform(config, '/support'),
    await config.transform(config, '/changelog'),
    await config.transform(config, '/pricing'),
    await config.transform(config, '/signup'),
    await config.transform(config, '/login'),
  ],
};