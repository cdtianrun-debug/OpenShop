const fs = require('fs');

// 现有的8个产品ID
const products = [
  { id: '8ab1c313-99b1-40c7-ae39-d2b2baee12fe', name: 'Professional Resume Template Bundle', priority: '0.8' },
  { id: 'a1210336-bd32-4793-ba1d-4bf6d5f3f8c3', name: 'Modern Pitch Deck Template', priority: '0.8' },
  { id: 'b0d92180-79d8-47af-859c-c233f377ec86', name: 'Premium UI Icon Pack', priority: '0.8' },
  { id: 'b21cd37d-f593-47be-8cef-05e8d0ecd582', name: 'Modern Gradient Backgrounds Pack', priority: '0.8' },
  { id: 'c858db51-3df5-451f-a510-6e1ef74b24f0', name: 'The Complete Guide to Remote Work', priority: '0.8' },
  { id: 'cf737fdf-7b54-4917-b835-2cfd963579eb', name: 'AI Prompt Library', priority: '0.8' },
  { id: 'eaa92b46-a7cc-4e4f-bf9b-922654c73065', name: 'Notion Ultimate Bundle', priority: '0.8' },
  { id: 'f04bd1c8-adf7-4bd9-b6a4-47cd99be526f', name: 'Figma Masterclass', priority: '0.8' }
];

// 5个分类
const collections = [
  { id: '76619029-c936-4067-bef2-49acc0544fd8', name: 'Templates', priority: '0.7' },
  { id: '94f7b3cc-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'Design Assets', priority: '0.7' },
  { id: '7babe563-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'E-Books', priority: '0.7' },
  { id: '459fc039-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'Video Courses', priority: '0.7' },
  { id: 'ff7db5da-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'Productivity', priority: '0.7' }
];

// 静态页面
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.7', changefreq: 'monthly' },
  { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
  { loc: '/privacy', priority: '0.5', changefreq: 'yearly' }
];

const baseUrl = 'https://scsc.qzz.io';
const today = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// 添加静态页面
staticPages.forEach(page => {
  sitemap += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

// 添加产品页面
products.forEach(product => {
  sitemap += `  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${product.priority}</priority>
  </url>
`;
});

// 添加分类页面
collections.forEach(collection => {
  sitemap += `  <url>
    <loc>${baseUrl}/collections/${collection.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${collection.priority}</priority>
  </url>
`;
});

sitemap += `</urlset>`;

fs.writeFileSync('public/sitemap.xml', sitemap, 'utf8');
console.log('✅ sitemap.xml 已生成');
console.log(`   - 静态页面: ${staticPages.length}个`);
console.log(`   - 产品页面: ${products.length}个`);
console.log(`   - 分类页面: ${collections.length}个`);
console.log(`   - 总计: ${staticPages.length + products.length + collections.length}个URL`);
