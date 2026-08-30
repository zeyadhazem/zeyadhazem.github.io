import React, { useEffect, useRef } from 'react';
import './Hero.css';
import { useImageLoadState } from '../../useImageLoadState';

// 20x27 blurred JPEG of ProfilePhoto, inlined so the reserved circle is painted
// on first render instead of sitting empty until the photo arrives.
const PROFILE_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/2wBDABMNDhEODBMRDxEVFBMXHTAfHRoaHToqLCMwRT1JR0Q9Q0FMVm1dTFFoUkFDX4JgaHF1e3x7SlyGkIV3j214e3b/2wBDARQVFR0ZHTgfHzh2T0NPdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnb/wAARCAAbABQDASIAAhEBAxEB/8QAGgABAAIDAQAAAAAAAAAAAAAAAAQFAgMGB//EAB8QAAICAgIDAQAAAAAAAAAAAAECAAMEEQVBEhMhMf/EABcBAAMBAAAAAAAAAAAAAAAAAAABAwL/xAAZEQADAQEBAAAAAAAAAAAAAAAAAREhAiL/2gAMAwEAAhEDEQA/AOntYV1lj1K+jMN7kEDXUx5XmcbHqasOGc/NSDx93rPsu0qnuTZXmNMtSv2IW1HHkrAgxAR55Y7WWeTEsTN7ZdjUrSzHQjAAOUAfyMwAZLaGvs1dhGeaTMe3LrqCrvXUSKt9oXQcxDR1H//Z';

const U = process.env.PUBLIC_URL;

// srcset widths are the measured rendered box widths x dpr2. `.image-wrapper` is
// 400px, stepping to 300 / 250 / 200 at the 1024 / 768 / 480 breakpoints
// (Hero.css), so a 2x screen needs at most 800px and a phone needs 400px.
// Verified live: 336-480px viewport -> 200px box, 600-768 -> 250, 820-1024 -> 300,
// >=1100 -> 400.
const HERO_SIZES =
  '(max-width: 480px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 400px';
const heroSet = (ext) =>
  [200, 400, 600, 800].map((w) => `${U}/ProfilePhoto-${w}.${ext} ${w}w`).join(', ');
const HERO_PHOTO_FALLBACK = `${U}/ProfilePhoto-800.jpg`;

const Hero = () => {
  const heroRef = useRef(null);
  // The LCP element. Preloaded from index.html with a matching imagesrcset and
  // fetchpriority="high"; nothing gates it and nothing waits on it.
  const { imgRef, loaded: photoLoaded, handleLoad } = useImageLoadState(
    HERO_PHOTO_FALLBACK,
    heroSet('jpg')
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
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-greeting">
              <span className="greeting-text">Hello, I'm</span>
            </div>
            <h1 className="hero-title">
              <span className="hero-title-line">Zeyad Saleh</span>
            </h1>
            <p className="hero-subtitle">
              Staff Software Engineer at Apple
            </p>
            <p className="hero-description">
              Leading media architecture for Apple Intelligence and driving the future of Siri.
              Passionate about building innovative products that enhance millions of users' daily experiences.
            </p>
            <div className="hero-cta">
              <button
                className="cta-button primary"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn more
              </button>
              <button
                className="cta-button secondary"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View projects
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div
              className="image-wrapper"
              style={{ '--placeholder': `url("${PROFILE_PLACEHOLDER}")` }}
            >
              <picture>
                <source srcSet={heroSet('avif')} sizes={HERO_SIZES} type="image/avif" />
                <source srcSet={heroSet('webp')} sizes={HERO_SIZES} type="image/webp" />
                <img
                  ref={imgRef}
                  /* src is assigned in a layout effect, after this <img> is
                     inside the <picture>. See useImageLoadState. There is no
                     onError by design: on failure the photo stays transparent
                     and the blur placeholder shows, rather than a broken glyph. */
                  sizes={HERO_SIZES}
                  alt="Zeyad Saleh - Staff Software Engineer at Apple"
                  className={`profile-image${photoLoaded ? ' is-loaded' : ''}`}
                  width="800"
                  height="1089"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={handleLoad}
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </section>
  );
};

export default Hero;