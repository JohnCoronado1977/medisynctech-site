MediSync Technologies — approved neon landing page build.

Upload index.html, styles.css, script.js to the ROOT of your GitHub Pages repository.
This build intentionally keeps the site self-contained: the logo, MedTrak icon, and phone previews are rendered with HTML/CSS, so there are no missing image dependencies.
The existing animated particle behavior is preserved and the hero-to-apps transition is continuous to avoid the banding issue.


MEDTRAK SHOWCASE UPDATE
- Expanded the Apps section around MedTrak.
- Added six feature chips.
- Added richer Home, Timeline and Reports phone previews.
- Added a four-card MedTrak feature overview below the primary showcase.
- Preserved the fast-scroll particle engine from the approved baseline.
- App Store badge is intentionally marked Coming to the App Store until the live listing URL is supplied.


PRODUCTION PERFORMANCE PASS
- Particle canvas now renders at 1x DPR instead of Retina 2x.
- Particle count reduced and trails simplified.
- Animation capped around 45fps for lower CPU/GPU load.
- Atmospheric gradients moved from JavaScript to CSS.
- Expensive backdrop-filter effects removed from scrolling surfaces.
- Large offscreen sections use content-visibility to reduce painting.
- Heavy scrolling shadows removed.
- prefers-reduced-motion is respected.


MOBILE SCROLL FIX
- Locks the page to vertical touch scrolling.
- Prevents horizontal overscroll/rubber-banding.
- Removes the horizontally scrolling phone-preview rail on mobile.
- Stacks MedTrak phone previews vertically so swiping up/down always scrolls the page.
- Constrains all major sections to the viewport width.
