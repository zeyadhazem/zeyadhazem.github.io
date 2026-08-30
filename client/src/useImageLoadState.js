import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Tracks whether a photo has actually produced pixels, so the blur placeholder
 * can be crossfaded out at the right moment.
 *
 * This deliberately does NOT sequence anything. An earlier version drove an
 * ordered chain here — each asset started only once the previous one settled —
 * and that turned a slow hero photo into a bottleneck for the entire page.
 * Ordering is now expressed as *priority* (fetchpriority, preload, loading
 * hints) and left to the browser's scheduler, so no asset can ever be blocked
 * behind another asset's completion. Nothing here gates anything.
 *
 * Two behaviours are load-bearing and must not be simplified away:
 *
 *  - `naturalWidth > 0` rather than just `complete`/`onLoad`. A cached *failed*
 *    image reports `complete === true` with `naturalWidth === 0`, and some
 *    engines fire `load` for an undecodable bitmap. Without this check a broken
 *    photo is faded in and the user sees a broken-image glyph over a perfectly
 *    good placeholder. There is deliberately no error handler: on failure
 *    `loaded` stays false, the <img> stays transparent, and the blur stands in.
 *
 *  - `src` AND `srcSet` are assigned in a layout effect, not rendered as props.
 *    React sets attributes on an element *before* appending it to its parent, so
 *    a rendered `src`/`srcset` is applied while the <img> is still detached from
 *    its <picture>. The browser immediately starts fetching a candidate from the
 *    <img>'s own attributes (the JPEG), then re-runs source negotiation on
 *    insertion and fetches the AVIF as well — both complete, and the JPEG is
 *    pure waste (measured at 296,649 B per visit when this regressed). Assigning
 *    them once the <img> is inside the <picture> makes negotiation run one time
 *    and fetch only the format and width it actually wants. `sizes` is safe to
 *    render normally: on its own it never triggers a fetch.
 */
export function useImageLoadState(fallbackSrc, fallbackSrcSet) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback((event) => {
    if (event.currentTarget.naturalWidth > 0) setLoaded(true);
  }, []);

  // Runs after the <img> is in the document but before paint. React has already
  // attached the load listener by this point, so no load event can be missed.
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img || img.getAttribute('src')) return;
    if (fallbackSrcSet) img.setAttribute('srcset', fallbackSrcSet);
    if (fallbackSrc) img.setAttribute('src', fallbackSrc);
  }, [fallbackSrc, fallbackSrcSet]);

  // A cached image can finish before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
  }, []);

  return { imgRef, loaded, handleLoad };
}
