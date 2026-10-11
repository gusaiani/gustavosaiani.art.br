// Post-build step. Writes one HTML file per work at build/work/<slug>/index.html
// with page-specific <title>, description, Open Graph and Twitter tags, so link
// previews (WhatsApp, iMessage, Slack, X) and search engines get the right
// metadata without executing JavaScript. Also rewrites build/index.html with
// the home metadata and writes build/sitemap.xml.
const fs = require("fs");
const path = require("path");
const loadImages = require("./load-images");
const { SITE_URL, homeMeta, paintingMeta, renderHead } = require("./meta");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const OG_DIR = path.join(ROOT, "public", "og");

const template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");

// Strip whatever metadata public/index.html carries so each page gets exactly one set.
function stripMeta(html) {
  return html
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"\s+content="[^"]*"\s*\/?>/g, "")
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
}

function renderPage(meta) {
  const base = stripMeta(template);
  if (!base.includes("</head>")) throw new Error("build/index.html has no </head>");
  return base.replace("</head>", `${renderHead(meta)}</head>`);
}

const images = loadImages();

fs.writeFileSync(path.join(BUILD, "index.html"), renderPage(homeMeta()));

let written = 0;
for (const image of images) {
  const hasOg = fs.existsSync(path.join(OG_DIR, `${image.slug}.jpg`));
  const dir = path.join(BUILD, "work", image.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPage(paintingMeta(image, hasOg)));
  written += 1;
}

const visible = images
  .filter(image => image.visible)
  .sort((a, b) => a.position - b.position);
const urls = [`${SITE_URL}/`, ...visible.map(image => `${SITE_URL}/work/${image.slug}`)];
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemap);

console.log(`prerender: wrote ${written} work pages, home page and sitemap (${urls.length} URLs)`);
