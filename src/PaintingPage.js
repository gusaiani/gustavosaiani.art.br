import React, { useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import images from "./data/images";

const S3_BASE = "https://s3-sa-east-1.amazonaws.com/gustavosaiani.com";
const ZOOM = 2.5;
const LENS_SIZE = 320;

function PaintingPage() {
  const { slug } = useParams();
  const image = images.data.find(img => img.slug === slug);
  const imgRef = useRef(null);
  const [lens, setLens] = useState({ active: false, x: 0, y: 0, bgX: 0, bgY: 0 });

  const handleMouseMove = useCallback(e => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Position lens centered on cursor
    const lensLeft = e.clientX - LENS_SIZE / 2;
    const lensTop = e.clientY - LENS_SIZE / 2;

    // Background position for zoomed image
    const bgX = -(x * ZOOM - LENS_SIZE / 2);
    const bgY = -(y * ZOOM - LENS_SIZE / 2);

    setLens({
      active: true,
      left: lensLeft,
      top: lensTop,
      bgX,
      bgY,
      imgWidth: rect.width * ZOOM,
      imgHeight: rect.height * ZOOM,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setLens(prev => ({ ...prev, active: false }));
  }, []);

  if (!image) {
    return (
      <div className="painting-page">
        <header className="painting-header">
          <Link to="/" className="back-link">Gustavo Saiani</Link>
        </header>
        <p>Work not found.</p>
      </div>
    );
  }

  const largeSrc = `${S3_BASE}/large/${image.filename}`;

  // Find prev/next for navigation
  const visible = images.data
    .filter(img => img.visible)
    .sort((a, b) => a.position - b.position);
  const currentIndex = visible.findIndex(img => img.slug === slug);
  const prev = currentIndex > 0 ? visible[currentIndex - 1] : null;
  const next = currentIndex < visible.length - 1 ? visible[currentIndex + 1] : null;

  return (
    <div className="painting-page">
      <header className="painting-header">
        <Link to="/" className="back-link">Gustavo Saiani</Link>
      </header>

      <div className="painting-container">
        <div
          className="painting-img-wrapper"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            ref={imgRef}
            alt={image.name}
            src={largeSrc}
            className="painting-img"
          />
          {lens.active && (
            <div
              className="magnifier-lens"
              style={{
                left: lens.left,
                top: lens.top,
                width: LENS_SIZE,
                height: LENS_SIZE,
                backgroundImage: `url(${largeSrc})`,
                backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
                backgroundSize: `${lens.imgWidth}px ${lens.imgHeight}px`,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
        </div>

        <div className="painting-info">
          <p className="painting-title">
            <b>{image.name}</b>, {image.date}
          </p>
          <p>{image.material}</p>
          <p>{image.height} × {image.width}cm</p>
        </div>

        <nav className="painting-nav">
          {prev ? (
            <Link to={`/work/${prev.slug}`} className="nav-link">← {prev.name}</Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/work/${next.slug}`} className="nav-link">{next.name} →</Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}

export default PaintingPage;
