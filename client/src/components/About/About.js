import React, { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const aboutRef = useRef(null);

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
            <div className="image-container">
              <img src={process.env.PUBLIC_URL + '/AboutMePhoto.jpeg'} alt="Zeyad Saleh" />
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