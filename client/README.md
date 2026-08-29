# Client

The React front end for [zeyadhazem.github.io](https://zeyadhazem.github.io/). Built with
Create React App (`react-scripts` 5), React 19, three.js via
`@react-three/fiber` + `@react-three/drei`, and GSAP.

Deployment is driven from the repository root — see the top-level `README.md`. Pushing to
`master` triggers a pre-push hook that runs `npm run deploy`.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server on [localhost:3000](http://localhost:3000) |
| `npm test` | Jest + React Testing Library |
| `npm run build` | Production bundle into `build/` |
| `npm run deploy` | Builds, then publishes `build/` to the `gh-pages` branch |

## Layout

```
public/          Everything served verbatim. Photo derivatives, the three .glb
                 models, the HDR environment map, icons, manifest, resume PDF.
public/hdri/     Self-hosted environment map for the 3D scenes.
assets-source/   Full-resolution photo and model originals. Deliberately outside
                 public/ so they are kept in git but never deployed.
src/components/  One folder per section: Navigation, Hero, About, Projects, Footer.
src/components/constants.js  Project copy plus each model's path, scale and camera.
```

## Asset conventions

- **Photos** are served through `<picture>` as AVIF → WebP → JPEG, sized to 2x the
  largest box the CSS ever paints them at. Each carries `width`/`height` and sits over an
  inlined blur placeholder so the box is filled from first render.
- **Models** are glTF-binary, compressed with `gltf-transform` using only extensions the
  bundled loader handles natively (`EXT_texture_webp`, `KHR_mesh_quantization`) — no
  external decoder, no CDN. Their fetch is deferred until the card nears the viewport.
- **Regenerating a derivative** means re-running the resize/re-encode against the original
  in `assets-source/`, not editing the file in `public/`.
