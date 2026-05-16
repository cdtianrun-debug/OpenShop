const fs = require('fs');

// 生成 robots.txt
const robotsTxt = `User-agent: *
Allow: /
Allow: /about
Allow: /contact
Allow: /faq
Allow: /terms
Allow: /privacy
Allow: /products
Allow: /collections
Allow: /product/
Allow: /collection/
Disallow: /admin
Disallow: /api/

Sitemap: https://scsc.qzz.io/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 10
`;

// 生成结构化数据 (JSON-LD) - Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DigitalVault",
  "url": "https://scsc.qzz.io",
  "logo": "https://scsc.qzz.io/logo.png",
  "description": "Premium digital products marketplace offering resume templates, design assets, e-books, and video courses.",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "cdtianrun@gmail.com",
    "contactType": "customer service"
  },
  "sameAs": []
};

// 生成结构化数据 - WebSite
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DigitalVault",
  "url": "https://scsc.qzz.io",
  "description": "Premium digital products marketplace",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://scsc.qzz.io/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// 产品数据
const products = [
  {
    id: '8ab1c313-99b1-40c7-ae39-d2b2baee12fe',
    name: 'Professional Resume Template Bundle',
    description: '20+ professionally designed resume templates for Microsoft Word and Google Docs. Includes matching cover letter templates and ATS-optimized formats.',
    price: '4.99',
    currency: 'USD',
    category: 'Templates'
  },
  {
    id: 'a1210336-bd32-4793-ba1d-4bf6d5f3f8c3',
    name: 'Modern Pitch Deck Template',
    description: 'Professional pitch deck templates for startups and businesses. Impress investors with stunning presentations.',
    price: '4.99',
    currency: 'USD',
    category: 'Templates'
  },
  {
    id: 'b0d92180-79d8-47af-859c-c233f377ec86',
    name: 'Premium UI Icon Pack',
    description: '1000+ premium UI icons for web and mobile applications. Multiple formats included.',
    price: '4.99',
    currency: 'USD',
    category: 'Design Assets'
  },
  {
    id: 'b21cd37d-f593-47be-8cef-05e8d0ecd582',
    name: 'Modern Gradient Backgrounds Pack',
    description: 'Beautiful gradient backgrounds for web design, social media, and presentations.',
    price: '2.99',
    currency: 'USD',
    category: 'Design Assets'
  },
  {
    id: 'c858db51-3df5-451f-a510-6e1ef74b24f0',
    name: 'The Complete Guide to Remote Work',
    description: 'Comprehensive e-book covering remote work best practices, tools, and productivity tips.',
    price: '2.99',
    currency: 'USD',
    category: 'E-Books'
  },
  {
    id: 'cf737fdf-7b54-4917-b835-2cfd963579eb',
    name: 'AI Prompt Library',
    description: 'Collection of 500+ AI prompts for ChatGPT, Claude, and other AI tools. Boost your productivity.',
    price: '2.99',
    currency: 'USD',
    category: 'Productivity'
  },
  {
    id: 'eaa92b46-a7cc-4e4f-bf9b-922654c73065',
    name: 'Notion Ultimate Bundle',
    description: 'Complete Notion template bundle with 50+ templates for productivity, project management, and more.',
    price: '4.99',
    currency: 'USD',
    category: 'Productivity'
  },
  {
    id: 'f04bd1c8-adf7-4bd9-b6a4-47cd99be526f',
    name: 'Figma Masterclass',
    description: 'Complete video course on Figma design tool. Learn UI/UX design from scratch.',
    price: '9.99',
    currency: 'USD',
    category: 'Video Courses'
  }
];

// 生成产品结构化数据
const productSchemas = products.map(product => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "url": `https://scsc.qzz.io/product/${product.id}`,
  "category": product.category,
  "brand": {
    "@type": "Brand",
    "name": "DigitalVault"
  },
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": product.currency,
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "DigitalVault"
    }
  }
}));

// 写入文件
fs.writeFileSync('public/robots.txt', robotsTxt, 'utf8');
console.log('✅ robots.txt 已生成');

fs.writeFileSync('public/schema-organization.json', JSON.stringify(organizationSchema, null, 2), 'utf8');
fs.writeFileSync('public/schema-website.json', JSON.stringify(websiteSchema, null, 2), 'utf8');
console.log('✅ 结构化数据已生成');

// 生成产品schema目录
if (!fs.existsSync('public/schema')) {
  fs.mkdirSync('public/schema', { recursive: true });
}

products.forEach(product => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "url": `https://scsc.qzz.io/product/${product.id}`,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": "DigitalVault"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "DigitalVault"
      }
    }
  };
  fs.writeFileSync(`public/schema/product-${product.id}.json`, JSON.stringify(schema, null, 2), 'utf8');
});

console.log(`✅ ${products.length}个产品结构化数据已生成`);

// 生成 Google Search Console 验证文件提示
console.log('\n📋 站长工具提交信息:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n🔍 Google Search Console:');
console.log('   1. 访问: https://search.google.com/search-console');
console.log('   2. 添加网站: https://scsc.qzz.io');
console.log('   3. 验证方式: 选择 "HTML 文件" 或 "DNS 记录"');
console.log('   4. 提交 sitemap: https://scsc.qzz.io/sitemap.xml');
console.log('\n🔍 Bing Webmaster Tools:');
console.log('   1. 访问: https://www.bing.com/webmasters');
console.log('   2. 添加网站: https://scsc.qzz.io');
console.log('   3. 验证方式: 选择 "XML 文件" 或 "DNS 记录"');
console.log('   4. 提交 sitemap: https://scsc.qzz.io/sitemap.xml');
console.log('\n📌 Sitemap URL:');
console.log('   https://scsc.qzz.io/sitemap.xml');
console.log('\n📌 Robots.txt URL:');
console.log('   https://scsc.qzz.io/robots.txt');
