import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);

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
            <div className="image-wrapper">
              <img
                src={process.env.PUBLIC_URL + '/ProfilePhoto.JPG'}
                alt="Zeyad Saleh - Staff Software Engineer at Apple"
                className="profile-image"
              />
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