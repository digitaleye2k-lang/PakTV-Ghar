# PakTV Ghar site media

## GUPSHUP tea gallery
The gallery uses the owner-supplied assets in this folder:

- `gupshup-chai-main.jpg` — courtyard tea conversation photo
- `gupshup-chai-rooftop.jpg` — rooftop conversation photo
- `gupshup-chai-poster.jpg` — silent-loop poster
- `gupshup-loop.mp4` — muted looping tea video, without visible captions

These assets are already uploaded to the repository and referenced from `gupshup.html`.

## Homepage Pakistani flag artwork

`pakistan-flag-art.svg` is a lightweight web-friendly representation of the user's supplied transparent waving-flag artwork, embedded as WebP in an SVG wrapper. It appears decoratively behind the right side of the main website at low opacity; it has no user interaction or tracking.

Image credit: imagery was supplied by the site's owner for this project.

## Movie headline banner pictures

The Movies page rotates through three user-supplied film-inspired pictures, in this order:

- `movie-headline-1.webp` — period Pakistani action / sword scene
- `movie-headline-2.webp` — rainy night drama scene
- `movie-headline-3.webp` — classic Punjabi countryside / mustard-field scene

The page also recognizes the original upload filenames as a fallback: `35cc81b7-a472-4dad-9fc9-bb36f86c1158.jpg`, `4595f7b2-1bc7-4e26-9369-d7f1e9d2ae26.jpg`, and `cad2d0ce-b651-4f07-a409-9293e0a39a76.jpg`. If neither filename is present, the Movies page shows a real publisher video thumbnail rather than a broken image. The owner has been provided a correctly named three-image WebP ZIP for uploading to this directory; those files were not present in `main/assets` when this feature was checked.

## TV Shows and Sports banners

The TV Shows banner is powered by available official TV show poster URLs from the site's programme metadata. The Sports banner uses genuine YouTube thumbnails from Pakistani sports broadcasters and publishers, without requiring separately uploaded images. Both rotate automatically, allow manual selection, and respect reduced-motion preferences.
