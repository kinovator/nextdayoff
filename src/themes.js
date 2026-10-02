/**
 * Theme registry for NextDayOff — color + font vibes for a joyful countdown.
 *
 * A theme IS the complete look: accent ramp, neutral ramp, page/surface tints
 * and display font. `dark` is just another theme in this list, not a separate
 * toggle. Palettes live as CSS variables in src/index.css under `[data-theme='…']`
 * blocks — keep the id and font family here in sync with those blocks.
 *
 * `swatch` is the picker's identity colour and `swatchInk` the readable
 * foreground for the checkmark drawn on it. `THEMES[0]` (Light) is the default
 * and matches the app's original look.
 */
export const DEFAULT_THEME_ID = 'tangerine';

export const THEMES = [
  {
    id: 'tangerine',
    name: 'Tangerine',
    emoji: '🍊',
    font: "'Fredoka', sans-serif",
    fontName: 'Fredoka',
    tagline: 'Zesty & playful',
    swatch: '#FF6B35',
    swatchInk: '#2A1006',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    emoji: '🌿',
    font: "'Quicksand', sans-serif",
    fontName: 'Quicksand',
    tagline: 'Fresh & hopeful',
    swatch: '#22C55E',
    swatchInk: '#04220F',
  },
  {
    id: 'blossom',
    name: 'Blossom',
    emoji: '🌸',
    font: "'Poppins', sans-serif",
    fontName: 'Poppins',
    tagline: 'Sweet & cheerful',
    swatch: '#EC4899',
    swatchInk: '#3B0A1F',
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    emoji: '🌊',
    font: "'Outfit', sans-serif",
    fontName: 'Outfit',
    tagline: 'Cool & breezy',
    swatch: '#0EA5E9',
    swatchInk: '#04202E',
  },
  {
    id: 'light',
    name: 'Light',
    emoji: '🌤️',
    font: "'Plus Jakarta Sans', sans-serif",
    fontName: 'Plus Jakarta Sans',
    tagline: 'Clean & classic',
    swatch: '#F59E0B',
    swatchInk: '#1C1917',
  },
  {
    id: 'dark',
    name: 'Dark',
    emoji: '🌙',
    font: "'Plus Jakarta Sans', sans-serif",
    fontName: 'Plus Jakarta Sans',
    tagline: 'Easy on the eyes',
    swatch: '#1C1917',
    swatchInk: '#FAFAF9',
  },
];

export function isValidThemeId(id) {
  return THEMES.some((theme) => theme.id === id);
}

export function getThemeById(id) {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
}