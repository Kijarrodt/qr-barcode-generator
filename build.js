const fs = require('fs');

const tools = JSON.parse(fs.readFileSync('tools.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');
const BASE_URL = 'https://qr-barcode-generator.pages.dev';

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

const internalLinksHtml = tools
  .map(t => `<a href="/${t.slug}.html" class="block p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-indigo-400 transition truncate">${t.toolName}</a>`)
  .join('\n');

function buildPage(item, isHome = false) {
  const canonical = isHome ? `${BASE_URL}/` : `${BASE_URL}/${item.slug}.html`;
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": item.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  });

  const html = template
    .replace(/\{\{TITLE\}\}/g, isHome ? 'Free QR Code & Barcode Generator Online - No Expiration' : item.title)
    .replace(/\{\{DESC\}\}/g, isHome ? 'Generate WiFi, vCard, WhatsApp QR codes, and EAN/UPC product barcodes instantly. 100% free, no expiration, no tracking.' : item.description)
    .replace(/\{\{H1\}\}/g, isHome ? 'Advanced QR & Barcode Generator' : item.h1)
    .replace(/\{\{CANONICAL\}\}/g, canonical)
    .replace(/\{\{TOOL_ID\}\}/g, item.id)
    .replace('{{TOOLS_JSON}}', JSON.stringify(tools))
    .replace('{{INTERNAL_LINKS}}', internalLinksHtml)
    .replace('{{FAQ_SCHEMA}}', faqSchema);

  const outFile = isHome ? 'dist/index.html' : `dist/${item.slug}.html`;
  fs.writeFileSync(outFile, html);
}

buildPage(tools[0], true);
tools.forEach(t => buildPage(t, false));

const sitemapUrls = [
  `  <url>\n    <loc>${BASE_URL}/</loc>\n    <priority>1.0</priority>\n  </url>`,
  ...tools.map(t => `  <url>\n    <loc>${BASE_URL}/${t.slug}.html</loc>\n    <priority>0.8</priority>\n  </url>`)
].join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>`;
fs.writeFileSync('dist/sitemap.xml', sitemap);
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`);

console.log(`Generated ${tools.length + 1} pages.`);
