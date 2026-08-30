import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Explicit top-of-page-downwards load order. Each step starts only once the
// previous one settles, so the page fills in the order a visitor reads it
// rather than in whatever order the network happens to resolve things.
//
//   0  hero photo
//   1  About photo
//   2  project model 1
//   3  project model 2
//   4  project model 3
//
// Model index i is permitted to start at step FIRST_MODEL + i.
export const STEP_HERO = 0;
export const STEP_ABOUT = 1;
export const STEP_FIRST_MODEL = 2;

/**
 * Drives the sequence. `advance(from)` is a no-op unless `from` is the step
 * currently in flight, which makes it idempotent: a duplicate load event, or a
 * component reporting twice, cannot skip a step.
 */
export function useLoadSequence() {
  const [step, setStep] = useState(STEP_HERO);
  const advance = useCallback((from) => {
    setStep((current) => (current === from ? current + 1 : current));
  }, []);
  return [step, advance];
}

/**
 * Tracks whether a photo actually produced pixels, and reports "settled"
 * exactly once whether it succeeded or failed.
 *
 * Settling on failure is load-bearing: the sequence is a chain, so a 404 or a
 * decode error that never settled would freeze every later step. There are
 * three ways a photo can finish and all three have to settle:
 *   - it loads             -> onLoad, naturalWidth > 0
 *   - it fails             -> onError
 *   - it was already in cache, broken, before React attached a handler
 *     -> complete === true with naturalWidth === 0, caught by the effect
 *
 * `fallbackSrc` is assigned imperatively rather than rendered as a src prop.
 * Measured reason: React builds an element and sets its attributes *before*
 * appending it to its parent, so a rendered `src` is set while the <img> is
 * still detached from its <picture>. The browser immediately starts fetching
 * that JPEG, then re-runs source negotiation on insertion and fetches the AVIF
 * too — both complete, and the JPEG is pure waste (measured at 77 KB + 219 KB
 * per visit). Assigning src from a layout effect, once the <img> is inside the
 * <picture> and in the document, makes negotiation run once and fetch only the
 * AVIF. The <source> children are still declarative; only src is deferred.
 */
export function useImageLoadSignal(active, onSettled, fallbackSrc) {
  const imgRef = useRef(null);
  const settledRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const settle = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [onSettled]);

  const handleLoad = useCallback(
    (event) => {
      // Some engines fire load even when the bitmap is unusable; naturalWidth
      // is the only reliable evidence that there are pixels to show.
      if (event.currentTarget.naturalWidth > 0) setLoaded(true);
      settle();
    },
    [settle]
  );

  // Deliberately does not setLoaded: on failure the <img> stays at opacity 0 so
  // the blur placeholder remains, instead of revealing a broken-image glyph.
  const handleError = useCallback(() => settle(), [settle]);

  // Layout effect, so it runs after the <img> is in the document but before the
  // browser paints. React has already attached the load/error listeners by this
  // point (they are wired during the mutation phase), so no event can be missed.
  useLayoutEffect(() => {
    if (!active || !fallbackSrc) return;
    const img = imgRef.current;
    if (!img || img.getAttribute('src')) return;
    img.setAttribute('src', fallbackSrc);
  }, [active, fallbackSrc]);

  // A cached image can finish before React attaches onLoad. Depends on `active`
  // because the <img> only enters the DOM once its turn in the chain arrives.
  // Runs after the layout effect above, so src is already assigned.
  useEffect(() => {
    if (!active) return;
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    settle();
  }, [active, settle]);

  return { imgRef, loaded, handleLoad, handleError };
}
