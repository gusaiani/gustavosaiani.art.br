// Loads src/data/images.js (an ES module) from a CommonJS build script.
const fs = require("fs");
const path = require("path");

module.exports = function loadImages() {
  const file = path.join(__dirname, "..", "src", "data", "images.js");
  const source = fs
    .readFileSync(file, "utf8")
    .replace(/export\s+default\s+images;?/, "module.exports = images;");
  const mod = { exports: {} };
  new Function("module", "exports", source)(mod, mod.exports);
  return mod.exports.data;
};
