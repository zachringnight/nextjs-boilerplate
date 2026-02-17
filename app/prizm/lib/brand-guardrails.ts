/**
 * Brand Guardrails - Panini-Only Enforcement
 *
 * Ensures all generated content only references approved brand products,
 * blocks competitor mentions, and auto-corrects common spelling errors.
 */

// =====================
// APPROVED PRODUCTS
// =====================

export const APPROVED_PRODUCTS = [
  // Flagship Lines
  'Prizm',
  'Select',
  'Optic',
  'Mosaic',
  'Donruss',
  'Panini',

  // Premium Lines
  'National Treasures',
  'Flawless',
  'Immaculate',
  'One',
  'Noir',
  'Eminence',
  'Impeccable',

  // Mid-Tier Lines
  'Contenders',
  'Spectra',
  'Absolute',
  'Phoenix',
  'Chronicles',
  'Score',
  'Prestige',
  'Playoff',
  'Origins',
  'Obsidian',
  'Illusions',
  'Certified',
  'Limited',
  'Crown Royale',
  'Gold Standard',
  'Elements',

  // Specialty Lines
  'Revolution',
  'Zenith',
  'Status',
  'Luminance',
  'Elite',
  'XR',
  'Vertex',
  'Encased',
  'Plates & Patches',

  // Retail Lines
  'Hoops',
  'Court Kings',
  'NBA Stickers & Cards',
  'Classics',
] as const;

export type ApprovedProduct = typeof APPROVED_PRODUCTS[number];

// =====================
// BLOCKED COMPETITOR BRANDS
// =====================

export const BLOCKED_BRANDS = [
  // Major Competitors
  'Topps',
  'Upper Deck',
  'Leaf',
  'Bowman',
  'Sage',
  'Press Pass',
  'Playoff Contenders', // Old brand before Panini acquisition

  // Competitor Product Lines
  'Chrome',
  'Heritage',
  'Stadium Club',
  'Archives',
  'SP Authentic',
  'The Cup',
  'Exquisite',
  'Ultimate Collection',
  'SPx',
  'Black Diamond',
  'Artifacts',
  'Ice',
  'O-Pee-Chee',
  'OPC',

  // Competitor Subbrands
  'Allen & Ginter',
  'Gypsy Queen',
  'Triple Threads',
  'Tier One',
  'Tribute',
  'Museum Collection',
  'Inception',
  'Gallery',
  'Fire',
  'WWE Undisputed', // Upper Deck
  'Goodwin Champions',

  // Vintage Competitors
  'Fleer',
  'Skybox',
  'Pinnacle',
  'Pacific',
  'Pro Set',
  'Wild Card',
  'Action Packed',
  'Classic',

  // General terms that might indicate competitor products
  'non-Panini',
  'non Panini',
] as const;

export type BlockedBrand = typeof BLOCKED_BRANDS[number];

// =====================
// SPELLING AUTO-CORRECT
// =====================

export const SPELLING_CORRECTIONS: Record<string, string> = {
  // Prizm variations
  'prism': 'Prizm',
  'priszm': 'Prizm',
  'prizim': 'Prizm',
  'prlzm': 'Prizm',
  'prizn': 'Prizm',
  'przm': 'Prizm',

  // Select variations
  'selct': 'Select',
  'slect': 'Select',

  // Optic variations
  'optik': 'Optic',
  'optiic': 'Optic',
  'optlc': 'Optic',

  // Mosaic variations
  'mosaik': 'Mosaic',
  'mosiac': 'Mosaic',
  'mossaic': 'Mosaic',

  // National Treasures variations
  'national treasure': 'National Treasures',
  'national treasures': 'National Treasures',
  'nationl treasures': 'National Treasures',
  'nt': 'National Treasures',

  // Flawless variations
  'flawles': 'Flawless',
  'fawless': 'Flawless',
  'flawlees': 'Flawless',

  // Immaculate variations
  'imaculate': 'Immaculate',
  'imacualte': 'Immaculate',
  'immaculte': 'Immaculate',

  // Contenders variations
  'contender': 'Contenders',
  'contendors': 'Contenders',
  'contenters': 'Contenders',

  // Donruss variations
  'donrus': 'Donruss',
  'donross': 'Donruss',

  // Spectra variations
  'spektra': 'Spectra',
  'spectraa': 'Spectra',

  // Phoenix variations
  'pheonix': 'Phoenix',
  'phenix': 'Phoenix',

  // Chronicles variations
  'chronicls': 'Chronicles',
  'chronicals': 'Chronicles',

  // Absolute variations
  'absolut': 'Absolute',
  'absolutte': 'Absolute',

  // Panini variations
  'panani': 'Panini',
  'pannini': 'Panini',
  'paniini': 'Panini',
  'paninine': 'Panini',
};

// =====================
// VALIDATION FUNCTIONS
// =====================

export interface BrandValidationResult {
  isValid: boolean;
  correctedText: string;
  blockedTermsFound: string[];
  correctionsApplied: Array<{ original: string; corrected: string }>;
  warnings: string[];
}

/**
 * Check if text contains any blocked competitor brands
 */
export function containsBlockedBrand(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const brand of BLOCKED_BRANDS) {
    // Use word boundary matching to avoid false positives
    const regex = new RegExp(`\\b${brand.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      found.push(brand);
    }
  }

  return found;
}

/**
 * Check if text contains an approved Panini product
 */
export function containsApprovedProduct(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const product of APPROVED_PRODUCTS) {
    const regex = new RegExp(`\\b${product.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      found.push(product);
    }
  }

  return found;
}

/**
 * Auto-correct common spelling errors for Panini products
 */
export function autoCorrectSpelling(text: string): {
  correctedText: string;
  corrections: Array<{ original: string; corrected: string }>;
} {
  let correctedText = text;
  const corrections: Array<{ original: string; corrected: string }> = [];

  for (const [misspelling, correction] of Object.entries(SPELLING_CORRECTIONS)) {
    const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
    const matches = correctedText.match(regex);

    if (matches) {
      for (const match of matches) {
        if (match.toLowerCase() !== correction.toLowerCase()) {
          corrections.push({ original: match, corrected: correction });
        }
      }
      correctedText = correctedText.replace(regex, correction);
    }
  }

  return { correctedText, corrections };
}

/**
 * Validate text content against brand guardrails
 * Returns validation result with corrected text and any issues found
 */
export function validateBrandContent(text: string): BrandValidationResult {
  const warnings: string[] = [];

  // Step 1: Auto-correct spelling
  const { correctedText, corrections } = autoCorrectSpelling(text);

  // Step 2: Check for blocked brands
  const blockedTermsFound = containsBlockedBrand(correctedText);

  // Step 3: Check for approved products (optional warning if none found)
  const approvedProducts = containsApprovedProduct(correctedText);
  if (approvedProducts.length === 0 && correctedText.length > 20) {
    warnings.push('No approved Panini products mentioned. Consider adding product references.');
  }

  // Build result
  const isValid = blockedTermsFound.length === 0;

  if (blockedTermsFound.length > 0) {
    warnings.push(`Competitor brands detected: ${blockedTermsFound.join(', ')}. Please remove these references.`);
  }

  if (corrections.length > 0) {
    warnings.push(`Spelling corrections applied: ${corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ')}`);
  }

  return {
    isValid,
    correctedText,
    blockedTermsFound,
    correctionsApplied: corrections,
    warnings,
  };
}

/**
 * Sanitize text by removing blocked brand mentions
 * Use with caution - this modifies content
 */
export function sanitizeBrandContent(text: string): string {
  let sanitized = text;

  // First auto-correct spelling
  const { correctedText } = autoCorrectSpelling(text);
  sanitized = correctedText;

  // Remove blocked brand mentions
  for (const brand of BLOCKED_BRANDS) {
    const regex = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '[BRAND]');
  }

  return sanitized;
}

/**
 * Get all approved products as a formatted list for reference
 */
export function getApprovedProductsList(): string[] {
  return [...APPROVED_PRODUCTS];
}

/**
 * Check if a specific product name is approved
 */
export function isApprovedProduct(productName: string): boolean {
  const lowerName = productName.toLowerCase().trim();
  return APPROVED_PRODUCTS.some(p => p.toLowerCase() === lowerName);
}

/**
 * Suggest the closest approved product for a given input
 */
export function suggestApprovedProduct(input: string): string | null {
  const lowerInput = input.toLowerCase().trim();

  // Check direct match first
  for (const product of APPROVED_PRODUCTS) {
    if (product.toLowerCase() === lowerInput) {
      return product;
    }
  }

  // Check spelling corrections
  const correction = SPELLING_CORRECTIONS[lowerInput];
  if (correction) {
    return correction;
  }

  // Check partial matches
  for (const product of APPROVED_PRODUCTS) {
    if (product.toLowerCase().includes(lowerInput) || lowerInput.includes(product.toLowerCase())) {
      return product;
    }
  }

  return null;
}
