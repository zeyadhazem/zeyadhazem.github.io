import fs from 'fs';
import path from 'path';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import { CanvasErrorBoundary, DRACO_DECODER_PATH } from './components/Projects/Projects';

// The jsdom shims these tests depend on (matchMedia for GSAP's ScrollTrigger,
// IntersectionObserver for every section) live in src/setupTests.js.
// IntersectionObserver never fires there, so the reveal animations stay inert;
// the asset load order is driven by load/error events, not by scroll.
//
// fireEvent (not dispatchEvent) so React's act() wraps the resulting state
// update and the suite stays warning-free.

/** Fire a successful load on an <img>, the way the browser would. */
function completeImage(img, naturalWidth = 800, naturalHeight = 1089) {
  Object.defineProperty(img, 'naturalWidth', { value: naturalWidth, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: naturalHeight, configurable: true });
  Object.defineProperty(img, 'complete', { value: true, configurable: true });
  fireEvent.load(img);
}

/** Fire a failed load: no pixels, error event. */
function failImage(img) {
  Object.defineProperty(img, 'naturalWidth', { value: 0, configurable: true });
  Object.defineProperty(img, 'complete', { value: true, configurable: true });
  fireEvent.error(img);
}

const heroPhoto = () => screen.getByAltText(/zeyad saleh - staff software engineer at apple/i);
const aboutPhoto = () => screen.queryByAltText(/^zeyad saleh$/i);

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
  // Nothing gates the hero: it is step 0 and must never wait on another asset.
  expect(photo).not.toHaveAttribute('loading', 'lazy');
});

test('About photo does not start until the hero photo settles', async () => {
  render(<App />);
  expect(aboutPhoto()).not.toBeInTheDocument();

  completeImage(heroPhoto());

  await waitFor(() => expect(aboutPhoto()).toBeInTheDocument());
  const photo = aboutPhoto();
  expect(photo).toHaveAttribute('width', '1000');
  expect(photo).toHaveAttribute('height', '1333');
  // It is eagerly loaded now, just second in line — no longer lazy, and no
  // longer demoted, because nothing else is competing when its turn arrives.
  expect(photo).not.toHaveAttribute('loading');
  expect(photo).not.toHaveAttribute('fetchpriority');
});

test('a failed hero photo still advances the chain to About', async () => {
  render(<App />);
  expect(aboutPhoto()).not.toBeInTheDocument();

  failImage(heroPhoto());

  await waitFor(() => expect(aboutPhoto()).toBeInTheDocument());
});

test('no model starts before the About photo settles', async () => {
  const { container } = render(<App />);
  expect(container.querySelectorAll('canvas')).toHaveLength(0);

  completeImage(heroPhoto());
  await waitFor(() => expect(aboutPhoto()).toBeInTheDocument());
  // Hero done, About in flight: still no model has been asked for.
  expect(container.querySelectorAll('canvas')).toHaveLength(0);
});

// Regression test. The first cut of the sequence computed the permitted model
// count as `step - STEP_FIRST_MODEL`, which is 0 at the very step the first
// model should start, so no model ever loaded. Only asserting the negative case
// above let that through; this asserts the positive one.
test('exactly one model starts once the About photo settles, not all three', async () => {
  const { container } = render(<App />);

  completeImage(heroPhoto());
  await waitFor(() => expect(aboutPhoto()).toBeInTheDocument());
  completeImage(aboutPhoto(), 1000, 1333);

  await waitFor(() => expect(container.querySelectorAll('canvas')).toHaveLength(1));
  // Sequential, not parallel: models 2 and 3 wait their turn.
  expect(container.querySelectorAll('canvas')).toHaveLength(1);
});

test('a failing model is caught, reported, and does not take the page down', () => {
  // The real failure path cannot be provoked through <Canvas> in jsdom: r3f only
  // builds a WebGL root once the container measures non-zero, and every rect is
  // 0 here, so useGLTF never runs. Test the boundary that carries the behaviour.
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

  // onFail is what advances the load sequence past a dead model.
  expect(onFail).toHaveBeenCalledTimes(1);
  // Children are replaced, not the whole tree.
  expect(container).toHaveTextContent('sibling survives');
  consoleError.mockRestore();
});

test('both photos offer AVIF and WebP ahead of the JPEG fallback', async () => {
  const { container } = render(<App />);
  completeImage(heroPhoto());
  await waitFor(() => expect(aboutPhoto()).toBeInTheDocument());

  const pictures = container.querySelectorAll('picture');
  expect(pictures).toHaveLength(2);
  pictures.forEach((picture) => {
    const types = [...picture.querySelectorAll('source')].map((s) => s.type);
    expect(types).toEqual(['image/avif', 'image/webp']);
    expect(picture.querySelector('img').getAttribute('src')).toMatch(/\.jpg$/);
  });
});

// Regression guard for the double-fetch fix. React sets attributes on an element
// before appending it to its parent, so a rendered `src` is applied while the
// <img> is still detached from its <picture>; the browser then fetches the JPEG
// *and* the negotiated AVIF (measured: 296,649 B wasted per visit). src is
// therefore assigned from a layout effect instead. If that effect is ever
// removed, src is never set and the photos silently never load — which is what
// these assertions catch.
test('photo src is assigned after mount, not rendered as a prop', async () => {
  const { container } = render(<App />);
  const hero = heroPhoto();
  expect(hero.getAttribute('src')).toBe(process.env.PUBLIC_URL + '/ProfilePhoto-800.jpg');

  completeImage(hero);
  await waitFor(() => expect(aboutPhoto()).toBeInTheDocument());
  expect(aboutPhoto().getAttribute('src')).toBe(
    process.env.PUBLIC_URL + '/AboutMePhoto-1000.jpg'
  );
  expect(container.querySelectorAll('picture img')).toHaveLength(2);
});

// Round-5 invariant. Measured cause: the card's copy started at opacity 0 and
// was revealed only by an IntersectionObserver adding .animate-in, then faded in
// over a 1s transition. On a cold, throttled load the 3D model was visible at
// 583ms while the card text did not reach readable opacity until 1315ms — the
// graphic beat its own card by 732ms. The card must now be readable with no
// model loaded and with no JS having run on it at all.
test('project card copy is present with no model loaded and is not gated behind a JS reveal', () => {
  const { container } = render(<App />);

  // IntersectionObserver is stubbed and never fires, and no model has loaded.
  expect(container.querySelectorAll('canvas')).toHaveLength(0);
  expect(container.querySelectorAll('.model-placeholder.is-hidden')).toHaveLength(0);

  // Every card's title, subtitle, description and highlights are in the document.
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

// jsdom does not apply the real stylesheet, so the DOM test above cannot prove
// the card is *visible*. Assert it against the CSS source instead: the card must
// not start transparent, and the JS-applied .animate-in must not be what makes
// it appear. This is the rule that would silently reintroduce the defect.
test('Projects.css does not hide the card behind an animate-in class', () => {
  const css = fs.readFileSync(
    path.join(__dirname, 'components', 'Projects', 'Projects.css'),
    'utf8'
  );
  const cardRule = css.match(/(^|\n)\.project-card\s*\{[^}]*\}/);
  expect(cardRule).not.toBeNull();
  expect(cardRule[0]).not.toMatch(/opacity\s*:\s*0/);
  expect(cardRule[0]).not.toMatch(/transform\s*:\s*translateY/);
  expect(css).not.toMatch(/\.project-card\.animate-in/);
  // The placeholder must still hold its box, so this rule has to survive.
  expect(css).toMatch(/\.model-placeholder\s*\{/);
});

// drei defaults the Draco decoder to https://www.gstatic.com/draco/... A CDN
// request from a first-party site is a hard fail, so this pins the override to
// a same-origin, relative path. It cannot prove no request leaves the origin —
// only the live run can — but it does catch the second argument to useGLTF
// being dropped, which is how the default would silently come back.
test('the Draco decoder is self-hosted, not fetched from a CDN', () => {
  expect(DRACO_DECODER_PATH).toBe(process.env.PUBLIC_URL + '/draco/');
  expect(DRACO_DECODER_PATH).not.toMatch(/^https?:\/\//);
  expect(DRACO_DECODER_PATH).not.toMatch(/gstatic|googleapis|unpkg|jsdelivr|githack/i);
  // DRACOLoader concatenates decoderPath + filename, so the slash is required.
  expect(DRACO_DECODER_PATH.endsWith('/')).toBe(true);
});

test('every model card reserves its box with a quiet placeholder, with no loading graphic', () => {
  const { container } = render(<App />);
  const placeholders = container.querySelectorAll('.model-placeholder');
  expect(placeholders).toHaveLength(3);
  // None retired yet, and none in the failed state.
  expect(container.querySelectorAll('.model-placeholder.is-hidden')).toHaveLength(0);
  expect(container.querySelectorAll('.model-placeholder.is-failed')).toHaveLength(0);
  // The removed loading graphic must not come back: no shimmer, no readout.
  expect(container.querySelectorAll('.model-skeleton')).toHaveLength(0);
  expect(container.querySelectorAll('.model-loader, .model-loader-text')).toHaveLength(0);
  placeholders.forEach((el) => expect(el).toHaveTextContent(''));
});
