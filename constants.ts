import { StylePreset } from './types';

export const APP_NAME = "ToonCraft Studio";
export const ENGINE_NAME = "Nano Banana Pro Engine 🍌";

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'ghibli',
    name: 'Ghibli Chill',
    description: 'Studio Ghibli style, lush greens, soft clouds, hand-drawn anime aesthetic.'
  },
  {
    id: 'cyber',
    name: 'Cyber-Vapor',
    description: 'Vaporwave aesthetic, neon purples, grid lines, retro-future, cyberpunk.'
  },
  {
    id: 'comic',
    name: 'Comic Pop',
    description: 'American comic book style, bold black outlines, halftone dots, vibrant red/blue.'
  },
  {
    id: 'pixar',
    name: 'Pixar Glow',
    description: 'Pixar 3D render style, octane render, soft global illumination, cute character.'
  },
  {
    id: 'nano',
    name: 'Nano Banana Special',
    description: 'Bright yellow and black contrast, pop-art, vibrant, energetic, graffiti style.'
  }
];

export const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Portrait (3:4)', value: '3:4' },
  { label: 'Landscape (4:3)', value: '4:3' },
  { label: 'Tall (9:16)', value: '9:16' },
  { label: 'Wide (16:9)', value: '16:9' },
];

export const MAX_HISTORY = 50;