// Local placeholder media layer.
//
// Every image and video lives in /public and is generated placeholder content
// (labelled with the car/category name) so the site works fully offline.
//
// To swap in your own assets later:
//   - Car photos:   replace files in /public/images named car-<slug>-1.jpg .. -4.jpg
//                    (angles: 1=Front, 2=Side, 3=Interior, 4=Rear) — keep the same filenames
//                    and everything just works, or point CAR_IMAGES below at new paths.
//   - Category art: replace /public/images/category-<slug>.jpg
//   - Scene photos: replace the matching file in /public/images (see GENERIC_IMAGES)
//   - Hero video:   replace /public/videos/hero.mp4
//   - Story video:  replace /public/videos/story.mp4

export const HERO_VIDEO_URL = "/videos/hero.mp4";
export const STORY_VIDEO_URL = "/videos/story.mp4";

const GENERIC_IMAGES = {
  "A3 Motors Showroom": "/images/hero-showroom.jpg",
  "Ford Mustang": "/images/cta-mustang.jpg",
  "A3 Motors Fleet": "/images/fleet-banner.jpg",
  "Explore All Categories": "/images/categories-banner.jpg",
  "A3 Motors — Our Story": "/images/story-poster.jpg",
  "A3 Motors Showroom Interior": "/images/showroom-interior.jpg",
  "A3 Motors": "/images/contact-hero.jpg",
  "Map — Faisalabad, Pakistan": "/images/map-placeholder.jpg",
};

export function carHeroImage(car) {
  return `/images/car-${car.slug}-1.jpg`;
}

export function carGalleryImages(car, count = 4) {
  return Array.from({ length: count }).map(
    (_, i) => `/images/car-${car.slug}-${i + 1}.jpg`
  );
}

export function categoryImage(category) {
  return `/images/category-${category.slug}.jpg`;
}

// Generic scene images are looked up by label so page code stays readable;
// falls back to the "A3 Motors" placeholder for any label not in the map.
export function genericImage(label) {
  return GENERIC_IMAGES[label] || "/images/contact-hero.jpg";
}
