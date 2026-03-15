import React from "react";
import { Link } from "react-router-dom";
import images from "./data/images";

const S3_BASE = "https://s3-sa-east-1.amazonaws.com/gustavosaiani.com";

const visibleImages = images.data
  .filter(image => image.visible)
  .sort((a, b) => a.position - b.position);

function thumbSrc(filename) {
  return `${S3_BASE}/thumbnails/${filename}`;
}

function largeSrc(filename) {
  return `${S3_BASE}/large/${filename}`;
}

function Gallery() {
  return (
    <div className="gallery">
      <header className="gallery-header">
        <h1>Gustavo Saiani</h1>
        <a href="mailto:gs@gustavosaiani.com">gs@gustavosaiani.com</a>
      </header>
      <div className="gallery-grid">
        {visibleImages.map(image => (
          <Link
            key={image.slug}
            to={`/work/${image.slug}`}
            className="gallery-item"
          >
            <div className="gallery-item-img-wrapper">
              <img
                alt={image.name}
                src={thumbSrc(image.filename)}
                onError={e => { e.target.onerror = null; e.target.src = largeSrc(image.filename); }}
                loading="lazy"
              />
            </div>
            <p className="gallery-item-title">{image.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
