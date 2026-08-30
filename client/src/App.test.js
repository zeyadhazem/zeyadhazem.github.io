import fs from 'fs';
import path from 'path';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import App from './App';
import { CanvasErrorBoundary } from './components/Projects/Projects';
import { DRACO_DECODER_PATH } from './components/Projects/ModelCanvas';

// The jsdom shims these tests need (matchMedia, IntersectionObserver,
// ResizeObserver) live in src/setupTests.js. Observers never fire on their own,
// so the default state of every test below is "the visitor has not scrolled and
// no asset has loaded" — which is the state the load-order invariants are about.
//
// fireEvent (not dispatchEvent) so React's act() wraps the state update.

function failImage(img) {
  Object.defineProperty(img, 'naturalWidth', { value: 0, configurable: true });
  Object.defineProperty(img, 'complete', { value: true, configurable: true });
  fireEvent.error(img);
}

const heroPhoto = () => screen.getByAltText(/zeyad saleh - staff software engineer at apple/i);
const aboutPhoto = () => screen.queryByAltText(/^zeyad saleh$/i);
const readSrc = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');

/** Wait out the double requestAnimationFrame that starts the models. */
const flushFrames = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

test('renders the hero name and role', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /zeyad saleh/i })).toBeInTheDocument();
  expect(screen.getAllByText(/staff software engineer at apple/i).length).toBeGreaterThan(0);
});

test('hero photo reserves its box and stays the prioritised LCP element', () => {
  render(<App />);
  const photo = heroPhoto();
  expect(photo).toHaveAttribute('width', '800');
  expect(photo).toHaveAttribute('height', '1089');
  expect(photo).toHaveAttribute('decoding', 'async');
  expect(photo).toHaveAttribute('fetchpriority', 'high');
  // The hero must never be deferred: it is the thing the visitor is waiting for.
  expect(photo).not.toHaveAttribute('loading', 'lazy');
});

// ---------------------------------------------------------------------------
// Round-7 invariant: NOTHING BLOCKS ON THE HERO.
// These replace the round-3 tests that asserted the opposite (that About waited
// for the hero and each model waited for its predecessor). That chain turned a
// slow hero photo into a bottleneck for the whole page, which is the bug.
// ---------------------------------------------------------------------------

test('About photo is present immediately, without the hero having loaded', () => {
  render(<App />);
  // No load event has been fired on the hero at all.
  expect(heroPhoto()).toBeInTheDocument();
  const about = aboutPhoto();
  expect(about).toBeInTheDocument();
  expect(about).toHaveAttribute('width', '1000');
  expect(about).toHaveAttribute('height', '1333');
  // Ordering is expressed as priority, not as a gate.
  expect(about).toHaveAttribute('loading', 'lazy');
  expect(about).toHaveAttribute('fetchpriority', 'low');
});

test('a broken hero photo does not hold back About or the project cards', () => {
  const { container } = render(<App />);
  failImage(heroPhoto());

  // About is still there and still able to load.
  expect(aboutPhoto()).toBeInTheDocument();
  // All three cards and their reserved boxes are unaffected.
  expect(container.querySelectorAll('.project-card')).toHaveLength(3);
  expect(container.querySelectorAll('.model-placeholder')).toHaveLength(3);
  // And the hero itself stays transparent rather than showing a broken glyph.
  expect(heroPhoto().className).not.toMatch(/is-loaded/);
});

test('all three models start after first paint with no scroll and no observer', async () => {
  const { container } = render(<App />);
  expect(container.querySelectorAll('canvas')).toHaveLength(0);

  // Nothing is scrolled and no photo ever loads. The only trigger is the frame
  // after the initial paint, so all three models must start regardless — the
  // owner asked for them to load "even if the user did not scroll down".
  await act(async () => {
    await flushFrames();
  });
  await waitFor(() => expect(container.querySelectorAll('canvas')).toHaveLength(3));

  // No model may depend on a photo, on another model, or on the viewport.
  expect(aboutPhoto().className).not.toMatch(/is-loaded/);
  expect(heroPhoto().className).not.toMatch(/is-loaded/);
  // No IntersectionObserver may exist in the model path. The only observer the
  // page creates is the Projects header reveal, at threshold 0.1 — anything
  // with a rootMargin would be a viewport gate creeping back in.
  const gates = global.__observers.filter((o) => o.options && o.options.rootMargin);
  expect(gates).toEqual([]);
});

test('the model path contains no viewport gate in source', () => {
  // Strip comments first: the source deliberately *names* the primitives it
  // rejects, and matching prose instead of code would fail for the wrong reason.
  const stripComments = (s) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const projects = stripComments(readSrc('components', 'Projects', 'Projects.js'));
  // A double requestAnimationFrame is the paint signal.
  expect(projects).toMatch(/requestAnimationFrame\([\s\S]*requestAnimationFrame\(/);
  // Each of these would re-couple models to something they must not wait on.
  expect(projects).not.toMatch(/rootMargin/);
  expect(projects).not.toMatch(/addEventListener\(\s*['"]load['"]/);
  expect(projects).not.toMatch(/setTimeout/);
});

test('a failing model is caught, reported, and does not take the page down', () => {
  // The real failure path cannot be provoked through <Canvas> in jsdom: r3f only
  // builds a WebGL root once the container measures non-zero, and every rect is
  // 0 here. Test the boundary that carries the behaviour.
  const Boom = () => {
    throw new Error('glb exploded');
  };
  const onFail = jest.fn();
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  const { container } = render(
    <div>
      <span>sibling survives</span>
      <CanvasErrorBoundary onFail={onFail}>
        <Boom />
      </CanvasErrorBoundary>
    </div>
  );

  expect(onFail).toHaveBeenCalledTimes(1);
  expect(container).toHaveTextContent('sibling survives');
  consoleError.mockRestore();
});

// ---------------------------------------------------------------------------
// Responsive photos
// ---------------------------------------------------------------------------

test('both photos offer AVIF and WebP ahead of the JPEG fallback', () => {
  const { container } = render(<App />);
  const pictures = container.querySelectorAll('picture');
  expect(pictures).toHaveLength(2);
  pictures.forEach((picture) => {
    const types = [...picture.querySelectorAll('source')].map((s) => s.type);
    expect(types).toEqual(['image/avif', 'image/webp']);
    expect(picture.querySelector('img').getAttribute('src')).toMatch(/\.jpg$/);
  });
});

test('hero srcset offers the widths its measured boxes need, with matching sizes', () => {
  render(<App />);
  const photo = heroPhoto();
  const sizes = photo.getAttribute('sizes');
  // Derived from the real breakpoints in Hero.css (400 / 300 / 250 / 200).
  expect(sizes).toBe(
    '(max-width: 480px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 400px'
  );
  const avif = photo.closest('picture').querySelector('source[type="image/avif"]');
  expect(avif.getAttribute('sizes')).toBe(sizes);
  [200, 400, 600, 800].forEach((w) => {
    expect(avif.getAttribute('srcSet')).toContain(`ProfilePhoto-${w}.avif ${w}w`);
  });
  // A 200px box on a 2x phone needs 400w; shipping only 800w was the waste.
  expect(avif.getAttribute('srcSet')).toContain('ProfilePhoto-400.avif 400w');
});

test('about srcset covers the fluid 1025-1279px range its container actually uses', () => {
  render(<App />);
  const photo = aboutPhoto();
  expect(photo.getAttribute('sizes')).toBe(
    '(max-width: 480px) 250px, (max-width: 1024px) 400px,' +
      ' (max-width: 1279px) calc((100vw - 256px) / 2), 500px'
  );
  const avif = photo.closest('picture').querySelector('source[type="image/avif"]');
  [250, 500, 800, 1000].forEach((w) => {
    expect(avif.getAttribute('srcSet')).toContain(`AboutMePhoto-${w}.avif ${w}w`);
  });
});

test('every responsive photo file referenced actually exists in public/', () => {
  render(<App />);
  const pub = path.join(__dirname, '..', 'public');
  const missing = [];
  document.querySelectorAll('picture source, picture img').forEach((el) => {
    (el.getAttribute('srcSet') || '').split(',').forEach((entry) => {
      const url = entry.trim().split(/\s+/)[0];
      if (!url) return;
      if (!fs.existsSync(path.join(pub, url.replace(/^\//, '')))) missing.push(url);
    });
  });
  expect(missing).toEqual([]);
});

test('photo src is assigned after mount, not rendered as a prop', () => {
  // React sets attributes before appending an element to its parent, so a
  // rendered `src` is applied while the <img> is detached from its <picture>;
  // the browser then fetches the JPEG *and* the negotiated AVIF (296,649 B of
  // waste per visit, measured). src is therefore assigned in a layout effect.
  // If that effect is removed, src is never set and the photos never load.
  render(<App />);
  expect(heroPhoto().getAttribute('src')).toBe(
    process.env.PUBLIC_URL + '/ProfilePhoto-800.jpg'
  );
  expect(aboutPhoto().getAttribute('src')).toBe(
    process.env.PUBLIC_URL + '/AboutMePhoto-1000.jpg'
  );
});

// ---------------------------------------------------------------------------
// Code splitting and card-copy guarantees
// ---------------------------------------------------------------------------

test('the 3D stack is not statically imported into the initial bundle', () => {
  // three/drei/DRACOLoader were 389 KB gzipped of a 391 KB initial chunk, and
  // `<div id="root">` stays empty until that arrives — which was the whole of
  // the owner's 10 s. They must only be reachable through a dynamic import.
  const projects = readSrc('components', 'Projects', 'Projects.js');
  expect(projects).toMatch(/lazy\(\s*\(\)\s*=>\s*import\(/);
  expect(projects).not.toMatch(/^import .*@react-three/m);
  expect(projects).not.toMatch(/^import .*from 'three'/m);
  // gsap was dead code sitting in the critical path; it must not come back.
  expect(projects).not.toMatch(/^import .*gsap/m);
  ['App.js', path.join('components', 'Hero', 'Hero.js'), path.join('components', 'About', 'About.js')]
    .forEach((f) => {
      const src = readSrc(f);
      expect(src).not.toMatch(/@react-three/);
      expect(src).not.toMatch(/from 'three'/);
      expect(src).not.toMatch(/gsap/);
    });
});

test('the Draco decoder is self-hosted, not fetched from a CDN', () => {
  expect(DRACO_DECODER_PATH).toBe(process.env.PUBLIC_URL + '/draco/');
  expect(DRACO_DECODER_PATH).not.toMatch(/^https?:\/\//);
  expect(DRACO_DECODER_PATH).not.toMatch(/gstatic|googleapis|unpkg|jsdelivr|githack/i);
  expect(DRACO_DECODER_PATH.endsWith('/')).toBe(true);
});

test('project card copy is present with no model loaded and is not gated behind a JS reveal', () => {
  const { container } = render(<App />);
  expect(container.querySelectorAll('canvas')).toHaveLength(0);
  expect(container.querySelectorAll('.model-placeholder.is-hidden')).toHaveLength(0);

  const cards = container.querySelectorAll('.project-card');
  expect(cards).toHaveLength(3);
  ['Apple Intelligence', 'HomePod Evolution', 'Smart Home Integration'].forEach((title) => {
    expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
  });
  expect(screen.getByText(/Tech lead for 11-person team/)).toBeInTheDocument();
  cards.forEach((card) => {
    expect(card.className).not.toMatch(/animate-in/);
    expect(card.querySelector('.project-title').textContent.trim().length).toBeGreaterThan(0);
    expect(card.querySelector('.project-description').textContent.trim().length).toBeGreaterThan(0);
    expect(card.querySelectorAll('.highlight-item').length).toBeGreaterThan(0);
  });
});

test('Projects.css does not hide the card behind an animate-in class', () => {
  const css = readSrc('components', 'Projects', 'Projects.css');
  const cardRule = css.match(/(^|\n)\.project-card\s*\{[^}]*\}/);
  expect(cardRule).not.toBeNull();
  expect(cardRule[0]).not.toMatch(/opacity\s*:\s*0/);
  expect(cardRule[0]).not.toMatch(/transform\s*:\s*translateY/);
  expect(css).not.toMatch(/\.project-card\.animate-in/);
  expect(css).toMatch(/\.model-placeholder\s*\{/);
});

test('every model card reserves its box with a quiet placeholder, with no loading graphic', () => {
  const { container } = render(<App />);
  const placeholders = container.querySelectorAll('.model-placeholder');
  expect(placeholders).toHaveLength(3);
  expect(container.querySelectorAll('.model-placeholder.is-hidden')).toHaveLength(0);
  expect(container.querySelectorAll('.model-placeholder.is-failed')).toHaveLength(0);
  expect(container.querySelectorAll('.model-skeleton')).toHaveLength(0);
  expect(container.querySelectorAll('.model-loader, .model-loader-text')).toHaveLength(0);
  placeholders.forEach((el) => expect(el).toHaveTextContent(''));
});
