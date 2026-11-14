// Paleta compartilhada entre CSS (style.css :root) e Three.js
export const C = {
  bg1: '#C2410C',
  bg2: '#7C2D12',
  vignette: '#2A0E04',
  accent1: '#FF6A13',
  accent2: '#FF8A1F',
  glow: '#FFB25C',
  white: '#FFFFFF',
  glass: 'rgba(60,25,10,.6)',
  // ingredientes
  bunTop: '#9A4512',
  bunRim: '#D88A35',
  bunCrumb: '#F1D29A',
  sesame: '#F6E7C1',
  patty: '#3A1E10',
  pattyCrust: '#5E331C',
  cheese: '#F29805',
  tomatoSkin: '#C81E14',
  tomatoFlesh: '#E8402E',
  tomatoGel: '#FF8160',
  onion: '#7B1F5E',
  onionPale: '#E7CBE0',
  lettuceDark: '#2F8A1E',
  lettuceLight: '#B5DE5A',
  baconMeat: '#8E2A1A',
  baconFat: '#EBC0A3',
  pickle: '#6E8F25',
};
export const isCoarse = matchMedia('(pointer: coarse)').matches;
export const isSmall = () => innerWidth < 820;
