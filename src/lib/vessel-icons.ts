import type mapboxgl from "mapbox-gl";
import type { VesselClass } from "@/types/vessel";
import { VESSEL_CLASS_CONFIG } from "./vessel-classifier";

// Top-down ship silhouette SVG paths (pointing NORTH / bow up)
// Viewbox: 0 0 32 32, centered, bow at top
const VESSEL_PATHS: Record<VesselClass, string> = {
  // VLCC: Wide, long tanker hull with pipeline on deck
  vlcc: "M16 2 L20 6 L21 10 L21 28 L20 30 L12 30 L11 28 L11 10 L12 6 Z M14 12 L18 12 L18 26 L14 26 Z",

  // Suezmax: Similar to VLCC, slightly narrower
  suezmax: "M16 3 L19 7 L20 11 L20 27 L19 29 L13 29 L12 27 L12 11 L13 7 Z M14 13 L18 13 L18 25 L14 25 Z",

  // Aframax: Medium tanker
  aframax: "M16 4 L19 8 L19 26 L18 28 L14 28 L13 26 L13 8 Z M14.5 12 L17.5 12 L17.5 24 L14.5 24 Z",

  // LNG: Distinctive with dome shapes (spherical tanks)
  lng: "M16 3 L19 7 L20 10 L20 28 L19 30 L13 30 L12 28 L12 10 L13 7 Z M14 11 A2 2 0 0 1 18 11 A2 2 0 0 1 14 11 M14 17 A2 2 0 0 1 18 17 A2 2 0 0 1 14 17 M14 23 A2 2 0 0 1 18 23 A2 2 0 0 1 14 23",

  // VLGC: Cylindrical tank outlines
  vlgc: "M16 3 L19 7 L19 27 L18 29 L14 29 L13 27 L13 7 Z M13.5 11 L18.5 11 L18.5 15 L13.5 15 Z M13.5 17 L18.5 17 L18.5 21 L13.5 21 Z M13.5 23 L18.5 23 L18.5 27 L13.5 27 Z",

  // LPG: Compact with small tanks
  lpg: "M16 5 L18 8 L18 26 L17 28 L15 28 L14 26 L14 8 Z M14.5 12 L17.5 12 L17.5 16 L14.5 16 Z M14.5 18 L17.5 18 L17.5 22 L14.5 22 Z",

  // Product tanker: Smaller, narrower hull
  product_tanker: "M16 4 L18 7 L18.5 10 L18.5 26 L18 28 L14 28 L13.5 26 L13.5 10 L14 7 Z",

  // Generic tanker: Simple arrow/chevron shape
  tanker_generic: "M16 4 L18 8 L18 26 L17 28 L15 28 L14 26 L14 8 Z",
};

const ICON_SIZE = 64; // pixels (retina)

function createIconImageData(
  path: string,
  fillColor: string,
): { width: number; height: number; data: Uint8Array } {
  const canvas = document.createElement("canvas");
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  const ctx = canvas.getContext("2d")!;

  // Scale from 32x32 viewbox to 64x64 canvas
  ctx.scale(2, 2);

  const path2d = new Path2D(path);

  // Dark stroke for contrast on dark map
  ctx.strokeStyle = "#0a0e17";
  ctx.lineWidth = 1.5;
  ctx.stroke(path2d);

  // Fill with class color
  ctx.fillStyle = fillColor;
  ctx.fill(path2d);

  // Lighter inner stroke for definition
  ctx.strokeStyle = fillColor;
  ctx.lineWidth = 0.3;
  ctx.stroke(path2d);

  const imageData = ctx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
  return { width: ICON_SIZE, height: ICON_SIZE, data: new Uint8Array(imageData.data.buffer) };
}

export function loadVesselIcons(map: mapboxgl.Map): void {
  const classes = Object.keys(VESSEL_PATHS) as VesselClass[];

  for (const cls of classes) {
    const color = VESSEL_CLASS_CONFIG[cls].color;
    const imgData = createIconImageData(VESSEL_PATHS[cls], color);
    if (!map.hasImage(cls)) {
      map.addImage(cls, imgData, { pixelRatio: 2 });
    }
  }

  console.log(`[Map] Loaded ${classes.length} vessel icons`);
}
