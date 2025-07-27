import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recipe Saver - Restaurant Experience Tracker",
    short_name: "Recipe Saver",
    description: "Track restaurant experiences and discover recipes to recreate your favorite dishes at home",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    orientation: "portrait-primary",
    categories: ["food", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-home.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Home screen showing recent restaurant visits",
      },
      {
        src: "/screenshots/mobile-camera.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Camera interface for capturing menu photos",
      },
    ],
  }
}
