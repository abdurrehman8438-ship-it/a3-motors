# A3 Motors

Premium car rental & showroom website — React + Vite + Tailwind CSS v4 + React Router + Framer Motion.

## Pages

- `/` — Home (hero, categories, featured cars, availability search, reviews, why-us, CTA)
- `/cars` — All cars with filters (price, transmission, fuel, seats) and sorting
- `/cars/:category` — Category listing (sedan, suv, luxury, sports, hatchback, offroad)
- `/cars/:category/:slug` — Individual car page (gallery, specs, features, rental duration pricing, related cars)
- `/about` — Story, mission & vision, why-choose-us, animated stats, categories overview, showroom
- `/contact` — Contact info, booking form, FAQ accordion, emergency call CTA

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- Car photos and hero/story videos are **local placeholder files** generated for this project —
  living in `public/images` and `public/videos` — so the site works fully offline with no
  external requests and no licensing concerns.
- To swap in your own media later, just replace the files with the **same filenames**:
  - `public/images/car-<slug>-1.jpg` … `-4.jpg` (1=Front, 2=Side, 3=Interior, 4=Rear) for each car
  - `public/images/category-<slug>.jpg` for each category
  - Scene photos: `hero-showroom.jpg`, `cta-mustang.jpg`, `fleet-banner.jpg`,
    `categories-banner.jpg`, `story-poster.jpg`, `showroom-interior.jpg`, `contact-hero.jpg`,
    `map-placeholder.jpg`
  - `public/videos/hero.mp4` (Home page hero) and `public/videos/story.mp4` (About "Our Story")
  - No code changes needed — see `src/data/media.js` if you want to rename or restructure paths.
- Car inventory and category data lives in `src/data/cars.js` — edit this file to add/remove cars
  or change prices, specs, and features.
- Colors, fonts, and other design tokens are defined in `src/index.css` under `@theme`.
