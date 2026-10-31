/**
 * WCAG 2.1 Compliant Relative Luminance Calculator.
 * Dynamically determines whether text should be dark or white
 * based on the background color luminance.
 */
export function getAccessibleTextColor(hexColor: string): '#FFFFFF' | '#0F172A' {
  if (!hexColor || typeof hexColor !== 'string') return '#FFFFFF';
  const cleanHex = hexColor.replace('#', '').trim();
  if (cleanHex.length !== 3 && cleanHex.length !== 6) return '#FFFFFF';

  let r: number, g: number, b: number;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }

  // YIQ formula (0 to 255): >= 150 means light background, requires dark text
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0F172A' : '#FFFFFF';
}
