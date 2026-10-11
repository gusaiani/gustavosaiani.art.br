// Single source of truth for page metadata (title, description, Open Graph,
// Twitter cards, canonical URL, JSON-LD). Used by scripts/prerender.js.
const SITE_URL = "https://gustavosaiani.art.br";
const SITE_NAME = "Gustavo Saiani";
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function homeMeta() {
  return {
    title: SITE_NAME,
    description: "Pinturas e desenhos de Gustavo Saiani.",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/og/home.jpg`,
    imageAlt: "Pinturas de Gustavo Saiani",
    type: "website",
  };
}

function paintingDescription(image) {
  return `${image.name}, ${image.date}. ${capitalize(image.material)}, ${image.height} × ${image.width} cm.`;
}

function paintingMeta(image, hasOgImage) {
  return {
    title: `${image.name} · ${SITE_NAME}`,
    description: paintingDescription(image),
    url: `${SITE_URL}/work/${image.slug}`,
    image: hasOgImage ? `${SITE_URL}/og/${image.slug}.jpg` : `${SITE_URL}/og/home.jpg`,
    imageAlt: `${image.name}, ${image.date}. ${capitalize(image.material)}.`,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "VisualArtwork",
      name: image.name,
      url: `${SITE_URL}/work/${image.slug}`,
      image: hasOgImage ? `${SITE_URL}/og/${image.slug}.jpg` : undefined,
      dateCreated: String(image.date),
      artMedium: image.material,
      width: { "@type": "QuantitativeValue", value: image.width, unitCode: "CMT" },
      height: { "@type": "QuantitativeValue", value: image.height, unitCode: "CMT" },
      creator: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
    },
  };
}

function renderHead(meta) {
  const e = escapeHtml;
  const tags = [
    `<title>${e(meta.title)}</title>`,
    `<meta name="description" content="${e(meta.description)}"/>`,
    `<link rel="canonical" href="${e(meta.url)}"/>`,
    `<meta property="og:type" content="${e(meta.type)}"/>`,
    `<meta property="og:site_name" content="${e(SITE_NAME)}"/>`,
    `<meta property="og:locale" content="pt_BR"/>`,
    `<meta property="og:title" content="${e(meta.title)}"/>`,
    `<meta property="og:description" content="${e(meta.description)}"/>`,
    `<meta property="og:url" content="${e(meta.url)}"/>`,
    `<meta property="og:image" content="${e(meta.image)}"/>`,
    `<meta property="og:image:secure_url" content="${e(meta.image)}"/>`,
    `<meta property="og:image:type" content="image/jpeg"/>`,
    `<meta property="og:image:width" content="${OG_WIDTH}"/>`,
    `<meta property="og:image:height" content="${OG_HEIGHT}"/>`,
    `<meta property="og:image:alt" content="${e(meta.imageAlt)}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${e(meta.title)}"/>`,
    `<meta name="twitter:description" content="${e(meta.description)}"/>`,
    `<meta name="twitter:image" content="${e(meta.image)}"/>`,
    `<meta name="twitter:image:alt" content="${e(meta.imageAlt)}"/>`,
  ];
  if (meta.jsonLd) {
    const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c");
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }
  return tags.join("");
}

module.exports = { SITE_URL, SITE_NAME, OG_WIDTH, OG_HEIGHT, homeMeta, paintingMeta, renderHead };
