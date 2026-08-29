import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';

// 20x27 blurred JPEG of ProfilePhoto, inlined so the reserved 400x400 circle is
// painted on first render instead of sitting empty until the photo arrives.
const PROFILE_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/2wBDABMNDhEODBMRDxEVFBMXHTAfHRoaHToqLCMwRT1JR0Q9Q0FMVm1dTFFoUkFDX4JgaHF1e3x7SlyGkIV3j214e3b/2wBDARQVFR0ZHTgfHzh2T0NPdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnb/wAARCAAbABQDASIAAhEBAxEB/8QAGgABAAIDAQAAAAAAAAAAAAAAAAQFAgMGB//EAB8QAAICAgIDAQAAAAAAAAAAAAECAAMEEQVBEhMhMf/EABcBAAMBAAAAAAAAAAAAAAAAAAABAwL/xAAZEQADAQEBAAAAAAAAAAAAAAAAAREhAiL/2gAMAwEAAhEDEQA/AOntYV1lj1K+jMN7kEDXUx5XmcbHqasOGc/NSDx93rPsu0qnuTZXmNMtSv2IW1HHkrAgxAR55Y7WWeTEsTN7ZdjUrSzHQjAAOUAfyMwAZLaGvs1dhGeaTMe3LrqCrvXUSKt9oXQcxDR1H//Z';

const Hero = () => {
  const heroRef = useRef(null);
  const imgRef = useRef(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);

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

  // A cached image can finish loading before React attaches onLoad, which would
  // leave the photo stuck at opacity 0 behind the placeholder. `complete` alone
  // is not enough: a cached *failed* image is also complete, with naturalWidth 0.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setPhotoLoaded(true);
    }
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
                <source
                  srcSet={process.env.PUBLIC_URL + '/ProfilePhoto-800.avif'}
                  type="image/avif"
                />
                <source
                  srcSet={process.env.PUBLIC_URL + '/ProfilePhoto-800.webp'}
                  type="image/webp"
                />
                <img
                  ref={imgRef}
                  src={process.env.PUBLIC_URL + '/ProfilePhoto-800.jpg'}
                  alt="Zeyad Saleh - Staff Software Engineer at Apple"
                  className={`profile-image${photoLoaded ? ' is-loaded' : ''}`}
                  width="800"
                  height="1089"
                  decoding="async"
                  fetchPriority="high"
                  // No onError handler on purpose: on failure photoLoaded stays
                  // false, the img stays at opacity 0 and the blur placeholder
                  // remains, rather than revealing a broken-image glyph.
                  onLoad={(e) => setPhotoLoaded(e.currentTarget.naturalWidth > 0)}
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