// Generates 1200x630 Open Graph images in public/og/ from the large S3 images.
// Requires ImageMagick 7 (`magick`). Skips slugs whose image already exists;
// pass --force to regenerate everything. Output is committed to the repo, so
// CI never needs to download the source images.
//
//   node scripts/og-images.js [--force]
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const loadImages = require("./load-images");
const { OG_WIDTH, OG_HEIGHT } = require("./meta");

const S3_BASE = "https://s3-sa-east-1.amazonaws.com/gustavosaiani.com/large";
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "og");
const CACHE_DIR = path.join(ROOT, ".cache", "og-src");
const BACKGROUND = "#fafafa";
const MARGIN = 30;
const MAX_BYTES = "280KB"; // WhatsApp ignores og:image above roughly 300 KB
const force = process.argv.includes("--force");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(CACHE_DIR, { recursive: true });

function download(filename) {
  const dest = path.join(CACHE_DIR, filename);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest;
  try {
    execFileSync("curl", ["-sfL", "-o", dest, `${S3_BASE}/${filename}`], { stdio: "inherit" });
    return dest;
  } catch (err) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    return null;
  }
}

const jpegArgs = [
  "-strip", "-colorspace", "sRGB", "-sampling-factor", "4:2:0",
  "-quality", "85", "-define", `jpeg:extent=${MAX_BYTES}`,
];

function renderPainting(src, dest) {
  execFileSync("magick", [
    src, "-auto-orient",
    "-resize", `${OG_WIDTH - 2 * MARGIN}x${OG_HEIGHT - 2 * MARGIN}>`,
    "-background", BACKGROUND, "-gravity", "center",
    "-extent", `${OG_WIDTH}x${OG_HEIGHT}`,
    ...jpegArgs, dest,
  ]);
}

function renderHome(sources, dest) {
  // Built with resize/extent/append instead of `montage`, which needs a font
  // for labels even when none are used.
  const cols = 3;
  const rows = 2;
  const pad = 10;
  const cellW = OG_WIDTH / cols;
  const cellH = OG_HEIGHT / rows;
  const cell = src => [
    "(", src, "-auto-orient",
    "-resize", `${cellW - 2 * pad}x${cellH - 2 * pad}`,
    "-background", BACKGROUND, "-gravity", "center", "-extent", `${cellW}x${cellH}`,
    ")",
  ];
  const rowArgs = [];
  for (let r = 0; r < rows; r += 1) {
    const row = sources.slice(r * cols, (r + 1) * cols);
    rowArgs.push("(", ...row.flatMap(cell), "+append", ")");
  }
  execFileSync("magick", [
    ...rowArgs, "-append",
    "-background", BACKGROUND, "-gravity", "center", "-extent", `${OG_WIDTH}x${OG_HEIGHT}`,
    ...jpegArgs, dest,
  ]);
}

const images = loadImages();
let generated = 0;
let skipped = 0;
let missing = [];

for (const image of images) {
  const dest = path.join(OUT_DIR, `${image.slug}.jpg`);
  if (!force && fs.existsSync(dest)) { skipped += 1; continue; }
  const src = download(image.filename);
  if (!src) { missing.push(image.slug); continue; }
  renderPainting(src, dest);
  generated += 1;
  console.log(`og: ${image.slug}.jpg (${Math.round(fs.statSync(dest).size / 1024)} KB)`);
}

const homeDest = path.join(OUT_DIR, "home.jpg");
if (force || !fs.existsSync(homeDest)) {
  const sources = images
    .filter(image => image.visible)
    .sort((a, b) => a.position - b.position)
    .map(image => download(image.filename))
    .filter(Boolean)
    .slice(0, 6);
  renderHome(sources, homeDest);
  generated += 1;
  console.log(`og: home.jpg (${Math.round(fs.statSync(homeDest).size / 1024)} KB)`);
}

console.log(`og: generated ${generated}, skipped ${skipped}${missing.length ? `, no source for: ${missing.join(", ")}` : ""}`);
