import Color from 'color';

/** @constant {number} WCAG_CONTRAST_THRESHOLD_AA Minimum contrast ratio for AA compliance. */
const WCAG_CONTRAST_THRESHOLD_AA = 4.5;

/** @constant {string} DEFAULT_CONTRAST_COLOR_DARK Default dark contrast color. */
const DEFAULT_CONTRAST_COLOR_DARK = 'rgb(0, 0, 0)';

/** @constant {string} DEFAULT_CONTRAST_COLOR_LIGHT Default light contrast color. */
const DEFAULT_CONTRAST_COLOR_LIGHT = 'rgb(255, 255, 255)';

/** @constant {string} FALLBACK_COLOR Fallback color if base color is invalid. */
const FALLBACK_COLOR = 'rgb(128, 128, 128)';

const getColor = (color) => {
  try {
    return Color(color);
  }
  catch (error) {
    console.warn('Invalid color:', color, error);
    return Color(FALLBACK_COLOR);
  }
};

/**
 * Get a color that has a contrast ratio of at least 4.5:1 with the given base color or black/white if not possible.
 * @param {string} baseColor Base color in any CSS color format.
 * @param {number} [maxAttempts] Maximum number of attempts to find a contrasting color.
 * @param {number} [step] Step size for adjusting the color.
 * @returns {string} A color that has a contrast ratio of at least 4.5:1 with the base color.
 */
export const getAccessibleContrastColor = (baseColor, maxAttempts = 20, step = 0.1) => {
  const original = getColor(baseColor);
  const isDark = original.isDark();

  const adjust = (color, amount) => isDark ? color.lighten(amount) : color.darken(amount);

  for (let i = 1; i <= maxAttempts; i++) {
    const candidate = adjust(original, step * i);
    const contrast = original.contrast(candidate);

    if (contrast >= WCAG_CONTRAST_THRESHOLD_AA) {
      return candidate.hex();
    }
  }

  return isDark ? DEFAULT_CONTRAST_COLOR_LIGHT : DEFAULT_CONTRAST_COLOR_DARK;
};

/**
 * Get a default contrast color based on the base color's lightness.
 * @param {string} baseColor Base color in any CSS color format.
 * @returns {string} Default contrast color based on the base color's lightness.
 */
export const getDefaultContrastColor = (baseColor) => {
  const original = getColor(baseColor);
  const isDark = original.isDark();

  return isDark ? DEFAULT_CONTRAST_COLOR_LIGHT : DEFAULT_CONTRAST_COLOR_DARK;
};
