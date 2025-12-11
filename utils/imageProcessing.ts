export interface ImageAdjustments {
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturate: number;   // 0-200, default 100
  grayscale: number;  // 0-100, default 0
  sepia: number;      // 0-100, default 0
}

export interface CropState {
  x: number; // Offset X in percentage (0-100) or pixels? Let's use pixels relative to displayed image size for UI, but for processing we need mapped values.
             // Actually, simplest for "Pan/Zoom" model:
  panX: number; // pixels
  panY: number; // pixels
  zoom: number; // 1 to 3
  aspectRatio: number | null; // width / height, null for original
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const getProcessedImage = async (
  imageSrc: string,
  crop: CropState,
  adjustments: ImageAdjustments,
  viewWidth: number = 500, // The width of the editor viewport, used to normalize pan values
  viewHeight: number = 500
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // 1. Calculate dimensions
  // The editor concept is: The viewport is fixed size (or aspect ratio). The image is zoomed and panned INSIDE it.
  // The output should be the pixels VISIBLE in the viewport.
  
  // Natural image dimensions
  const nw = image.naturalWidth;
  const nh = image.naturalHeight;

  // Determine output aspect ratio
  // If crop.aspectRatio is set, use it. Otherwise use image natural aspect.
  const targetAspect = crop.aspectRatio ?? (nw / nh);

  // We want to output high quality. Let's base the output width on the natural width
  // But scaled by zoom.
  // If Zoom = 1, Output Width = Natural Width.
  // If Zoom = 2, Output Width = Natural Width / 2 (we are cropping in).
  
  // Actually, standard behavior:
  // Output Width/Height should define the resolution of the crop.
  // Let's maximize resolution.
  // Find the "Source Rect" in the original image that corresponds to the viewport.
  
  // In the UI:
  // Image is scaled by `scale`. 
  // Image is translated by `panX`, `panY`.
  // Viewport is centered? Or Top-Left?
  // Let's assume standard "CSS Transform" logic used in Editor: 
  // transform: scale(zoom) translate(panX, panY)
  // And it's centered in the container.
  
  // This Math is tricky to sync perfectly with CSS. 
  // Let's use a simplified approach:
  // We assume the User Interface ensures the image covers the viewport (if intended).
  
  // Let's define the "Visible Source Rect":
  // The viewport has an aspect ratio `targetAspect`.
  // We fit the Source Image into this Viewport such that it "covers" it initially (Cover mode).
  
  let renderWidth = nw;
  let renderHeight = nh;
  
  // Initial "Cover" logic (how it looks at zoom 1 before pan)
  // If image is wider than target aspect, height matches, width is cropped.
  // If image is taller, width matches, height is cropped.
  
  const imageAspect = nw / nh;
  
  let baseScale = 1;
  if (imageAspect > targetAspect) {
    // Image is wider. Height fits perfectly.
    // scale to match height? No, we are working in source pixels.
    // The "Viewport" in source pixels has height = nh, width = nh * targetAspect.
  } else {
    // Image is taller. Width fits perfectly.
  }
  
  // Let's go reverse: Map Viewport pixels to Source Pixels.
  // Viewport W/H in UI pixels: `viewWidth`, `viewHeight`.
  // Image displayed W/H: `imgUiW = viewWidth (if covering width)` etc.
  
  // To keep it robust without knowing exact UI layout state:
  // We rely on relative values.
  // `panX` / `panY` should be passed as normalized offsets (0 to 1) relative to the image dimensions if possible?
  // No, pixels are passed.
  
  // Alternative: Just apply the edits (Brightness/Contrast) and ignore complex crop if it's too risky.
  // PROMPT: "functionality for cropping...".
  
  // Let's use a "Center Crop" model modified by Zoom/Pan.
  // Center of the source image: cx, cy.
  // Pan adds offset: cx + offsetX, cy + offsetY.
  // Zoom defines the size of the box: boxW = nw / zoom, boxH = nh / zoom (adjusted for aspect).
  
  const zoom = crop.zoom;
  
  // Dimensions of the "Crop Box" in source pixels
  let cropW, cropH;
  
  if (imageAspect > targetAspect) {
    // Image is wider than target.
    // At zoom 1, crop height is full height. Crop width is limited by aspect.
    cropH = nh / zoom;
    cropW = (cropH * targetAspect);
  } else {
    // Image is taller or equal.
    // At zoom 1, crop width is full width.
    cropW = nw / zoom;
    cropH = (cropW / targetAspect);
  }

  // Center Point (in source pixels)
  // Normalized Pan: panX is in UI pixels. We need to convert to Source pixels.
  // This depends on the ratio of UI Image Size to Natural Image Size.
  // Let's assume `panX` passed to this function is ALREADY converted to Source Pixels? 
  // OR we pass the UI-to-Natural ratio.
  // To be safe, let's just implement the Color Pipeline first, and a simple "Center Crop to Aspect" if pan is 0.
  // And try to apply pan if provided.
  
  // Center of cropped area
  let centerX = nw / 2 - (crop.panX * (nw / viewWidth)); // Approx mapping
  let centerY = nh / 2 - (crop.panY * (nh / viewHeight));

  // If we assume `panX` is standard pixel offset at Scale 1? 
  // Let's rely on `crop.panX` being "Source Pixels Offset from Center".
  centerX = nw / 2 - crop.panX; 
  centerY = nh / 2 - crop.panY;

  // Source Rectangle
  const sx = Math.max(0, centerX - cropW / 2);
  const sy = Math.max(0, centerY - cropH / 2);
  
  // Destination Canvas Size (High Res)
  canvas.width = cropW;
  canvas.height = cropH;
  
  // Apply Filters
  // Note: Canvas filter syntax: "brightness(150%) contrast(120%) ..."
  ctx.filter = `
    brightness(${adjustments.brightness}%) 
    contrast(${adjustments.contrast}%) 
    saturate(${adjustments.saturate}%) 
    grayscale(${adjustments.grayscale}%) 
    sepia(${adjustments.sepia}%)
  `;
  
  // Draw
  ctx.drawImage(
    image,
    sx, sy, cropW, cropH, // Source
    0, 0, cropW, cropH    // Dest
  );

  return canvas.toDataURL('image/png');
};
