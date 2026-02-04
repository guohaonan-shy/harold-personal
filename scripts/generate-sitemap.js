const fs = require('fs');
const path = require('path');

const baseUrl = 'https://haroldguo.com'; // 请根据您的实际域名修改
const outDir = path.join(process.cwd(), 'out');

// 定义所有页面
const pages = [
  {
    url: baseUrl,
    changefreq: 'monthly',
    priority: '1.0',
  },
  // 未来可以在这里添加更多页面
  // {
  //   url: `${baseUrl}/projects/toeflair`,
  //   changefreq: 'weekly',
  //   priority: '0.8',
  // },
];

// 生成 sitemap XML
function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
}

// 写入文件
function writeSitemap() {
  try {
    // 确保 out 目录存在
    if (!fs.existsSync(outDir)) {
      console.error('❌ Error: out directory does not exist. Run build first.');
      process.exit(1);
    }

    const sitemap = generateSitemap();
    const sitemapPath = path.join(outDir, 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('✅ sitemap.xml generated successfully at:', sitemapPath);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

writeSitemap();
