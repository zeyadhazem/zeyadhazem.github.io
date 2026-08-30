import React, { useEffect, useRef } from 'react';
import './About.css';
import { useImageLoadState } from '../../useImageLoadState';

// 20x27 blurred JPEG of AboutMePhoto, inlined so the reserved square is painted
// on first render instead of sitting empty until the photo arrives.
const ABOUT_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/2wBDABMNDhEODBMRDxEVFBMXHTAfHRoaHToqLCMwRT1JR0Q9Q0FMVm1dTFFoUkFDX4JgaHF1e3x7SlyGkIV3j214e3b/2wBDARQVFR0ZHTgfHzh2T0NPdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnb/wAARCAAbABQDASIAAhEBAxEB/8QAGgAAAgIDAAAAAAAAAAAAAAAAAAUEBgECA//EACUQAAIBBAECBwEAAAAAAAAAAAECAAMEBRESEyEiMTJBUXGRof/EABYBAQEBAAAAAAAAAAAAAAAAAAIBA//EABkRAAMBAQEAAAAAAAAAAAAAAAABAhExA//aAAwDAQACEQMRAD8Ahrma1OqQQGG42x+QW9fgV4n5PlFDYiuz8tgCdqNF7cFVJBllO+BqlHSyCgrDfWH7CJEt6/Eaq/2Ez0WM0tr8dHxglhI7XyvUOyFG5nDgNckMNiKsqAt9VC9hyi8qS3VpLTpLHhYA9DQ5V++vaERL6R9QmLHp/9k=';

const U = process.env.PUBLIC_URL;

// `.image-container` is width:100% capped at 500px, dropping to 400px at the
// 1024 breakpoint and 250px at 480 (About.css). Between 1025 and 1279 it is
// fluid, because the two-column grid column is narrower than the 500px cap:
// (100vw - 160px container padding - 96px gap) / 2. Verified live against the
// rendered box: 336-480 -> 250, 600-1024 -> 400, 1100 -> 422, 1200 -> 472,
// >=1280 -> 500. The calc below reproduces those numbers exactly.
const ABOUT_SIZES =
  '(max-width: 480px) 250px, (max-width: 1024px) 400px,' +
  ' (max-width: 1279px) calc((100vw - 256px) / 2), 500px';
const aboutSet = (ext) =>
  [250, 500, 800, 1000].map((w) => `${U}/AboutMePhoto-${w}.${ext} ${w}w`).join(', ');
const ABOUT_PHOTO_FALLBACK = `${U}/AboutMePhoto-1000.jpg`;

const About = () => {
  const aboutRef = useRef(null);
  const { imgRef, loaded: photoLoaded, handleLoad } = useImageLoadState(
    ABOUT_PHOTO_FALLBACK,
    aboutSet('jpg')
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="about section" ref={aboutRef}>
      <div className="container">
        <div className="about-content">
          <div className="about-image">
            <div
              className="image-container"
              style={{ '--placeholder': `url("${ABOUT_PLACEHOLDER}")` }}
            >
              {/* Always mounted — it is no longer gated on the hero photo.
                  Ordering comes from loading="lazy" plus fetchpriority="low":
                  the browser holds it back until it is near the viewport and
                  never lets it contend with the hero, but a slow or broken hero
                  cannot stop it. The box is held by .image-container's
                  aspect-ratio and its ::before blur placeholder regardless. */}
              <picture>
                <source srcSet={aboutSet('avif')} sizes={ABOUT_SIZES} type="image/avif" />
                <source srcSet={aboutSet('webp')} sizes={ABOUT_SIZES} type="image/webp" />
                <img
                  ref={imgRef}
                  /* src is assigned in a layout effect, after this <img> is
                     inside the <picture>. See useImageLoadState. No onError by
                     design: on failure the blur placeholder stands in. */
                  sizes={ABOUT_SIZES}
                  alt="Zeyad Saleh"
                  className={photoLoaded ? 'is-loaded' : undefined}
                  width="1000"
                  height="1333"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  onLoad={handleLoad}
                />
              </picture>
            </div>
          </div>
          <div className="about-text">
            <h2 className="section-title">About Me</h2>
            <div className="about-description">
              <p className="lead-text">
                I'm a Staff Software Engineer at Apple, passionate about building impactful products that enhance millions of users' daily experiences.
              </p>
              <p>
                With over 8 years at Apple, I've led media architecture for Apple Intelligence, driven key HomePod updates featured at WWDC, and collaborated with 15+ partner teams to design APIs that power the future of Siri. I thrive in collaborative environments and enjoy tackling complex challenges that push the boundaries of what's possible.
              </p>
              <p>
                My work spans edge computing and on-device intelligence, platform architecture at scale, and data-driven decision-making to evolve products used by millions of users, always focusing on seamless user experiences and innovative solutions.
              </p>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">8+</span>
                <span className="stat-label">Years at Apple</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Daily Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Major Features</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;