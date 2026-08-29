import React, { useEffect, useRef, useState } from 'react';
import './About.css';

// 20x27 blurred JPEG of AboutMePhoto, inlined so the reserved square is painted
// on first render instead of sitting empty until the photo arrives.
const ABOUT_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/2wBDABMNDhEODBMRDxEVFBMXHTAfHRoaHToqLCMwRT1JR0Q9Q0FMVm1dTFFoUkFDX4JgaHF1e3x7SlyGkIV3j214e3b/2wBDARQVFR0ZHTgfHzh2T0NPdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnb/wAARCAAbABQDASIAAhEBAxEB/8QAGgAAAgIDAAAAAAAAAAAAAAAAAAUEBgECA//EACUQAAIBBAECBwEAAAAAAAAAAAECAAMEBRESEyEiMTJBUXGRof/EABYBAQEBAAAAAAAAAAAAAAAAAAIBA//EABkRAAMBAQEAAAAAAAAAAAAAAAABAhExA//aAAwDAQACEQMRAD8Ahrma1OqQQGG42x+QW9fgV4n5PlFDYiuz8tgCdqNF7cFVJBllO+BqlHSyCgrDfWH7CJEt6/Eaq/2Ez0WM0tr8dHxglhI7XyvUOyFG5nDgNckMNiKsqAt9VC9hyi8qS3VpLTpLHhYA9DQ5V++vaERL6R9QmLHp/9k=';

const About = () => {
  const aboutRef = useRef(null);
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
      { threshold: 0.2 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
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
    <section id="about" className="about section" ref={aboutRef}>
      <div className="container">
        <div className="about-content">
          <div className="about-image">
            <div
              className="image-container"
              style={{ '--placeholder': `url("${ABOUT_PLACEHOLDER}")` }}
            >
              <picture>
                <source
                  srcSet={process.env.PUBLIC_URL + '/AboutMePhoto-1000.avif'}
                  type="image/avif"
                />
                <source
                  srcSet={process.env.PUBLIC_URL + '/AboutMePhoto-1000.webp'}
                  type="image/webp"
                />
                <img
                  ref={imgRef}
                  src={process.env.PUBLIC_URL + '/AboutMePhoto-1000.jpg'}
                  alt="Zeyad Saleh"
                  className={photoLoaded ? 'is-loaded' : undefined}
                  width="1000"
                  height="1333"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  // No onError handler on purpose: on failure photoLoaded stays
                  // false, the img stays at opacity 0 and the blur placeholder
                  // remains, rather than revealing a broken-image glyph.
                  onLoad={(e) => setPhotoLoaded(e.currentTarget.naturalWidth > 0)}
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