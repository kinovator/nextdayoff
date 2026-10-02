/**
 * Theme + font registries for NextDayOff — a joyful countdown, styled your way.
 *
 * Themes and fonts are deliberately INDEPENDENT choices:
 *
 * - A theme is a colour package: accent ramp, neutral ramp, page/surface tints.
 *   `dark` is just another theme in this list, not a separate toggle. Palettes
 *   live as CSS variables in src/index.css under `[data-theme='…']` blocks —
 *   keep the ids in sync with those blocks.
 * - A font is a standalone display-face choice (`--app-font` on <html>, see
 *   `FONTS` below). Pick Blossom pinks with Fredoka, if that's your vibe.
 *
 * `swatch` is the picker's identity colour and `swatchInk` the readable
 * foreground for the checkmark drawn on it. The theme list is ordered with the
 * colourways first and Light/Dark at the bottom; `DEFAULT_THEME_ID` is the
 * first-run default.
 */
export const DEFAULT_THEME_ID = 'tangerine';
export const DEFAULT_FONT_ID = 'fredoka';

export const THEMES = [
  {
    id: 'tangerine',
    name: 'Tangerine',
    emoji: '🍊',
    tagline: 'Zesty & playful',
    swatch: '#FF6B35',
    swatchInk: '#2A1006',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    emoji: '🌿',
    tagline: 'Fresh & hopeful',
    swatch: '#22C55E',
    swatchInk: '#04220F',
  },
  {
    id: 'blossom',
    name: 'Blossom',
    emoji: '🌸',
    tagline: 'Sweet & cheerful',
    swatch: '#EC4899',
    swatchInk: '#3B0A1F',
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    emoji: '🌊',
    tagline: 'Cool & breezy',
    swatch: '#0EA5E9',
    swatchInk: '#04202E',
  },
  {
    id: 'light',
    name: 'Light',
    emoji: '🌤️',
    tagline: 'Clean & classic',
    swatch: '#F59E0B',
    swatchInk: '#1C1917',
  },
  {
    id: 'dark',
    name: 'Dark',
    emoji: '🌙',
    tagline: 'Easy on the eyes',
    swatch: '#1C1917',
    swatchInk: '#FAFAF9',
  },
];

/**
 * Display fonts (all loaded by the Google Fonts link in index.html).
 * `stack` is the single source of truth: the picker previews with it and
 * App.jsx writes it to `--app-font` on <html>.
 */
export const FONTS = [
  {
    id: 'fredoka',
    name: 'Fredoka',
    stack: "'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'baloo2',
    name: 'Baloo 2',
    stack: "'Baloo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'grandstander',
    name: 'Grandstander',
    stack: "'Grandstander', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'nunito',
    name: 'Nunito',
    stack: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'quicksand',
    name: 'Quicksand',
    stack: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'comfortaa',
    name: 'Comfortaa',
    stack: "'Comfortaa', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'poppins',
    name: 'Poppins',
    stack: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'outfit',
    name: 'Outfit',
    stack: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    stack: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
];

/** The font each theme shipped with before fonts were split out — used only to
 *  migrate an existing preference (stat_app_theme without stat_app_font) so the
 *  current look doesn't change under anyone. */
export const THEME_LEGACY_FONT = {
  tangerine: 'fredoka',
  meadow: 'quicksand',
  blossom: 'poppins',
  lagoon: 'outfit',
  light: 'jakarta',
  dark: 'jakarta',
};

export function isValidThemeId(id) {
  return THEMES.some((theme) => theme.id === id);
}

export function getThemeById(id) {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
}

export function isValidFontId(id) {
  return FONTS.some((font) => font.id === id);
}

export function getFontById(id) {
  return FONTS.find((font) => font.id === id) || FONTS[0];
}