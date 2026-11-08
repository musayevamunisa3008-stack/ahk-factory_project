/**
 * AHK FACTORY - FURNITURE CUSTOMIZER DATA & IMAGE MAPPING
 * 
 * Strict architectural separation between:
 * 1. Stable, language-independent unique IDs (slugs): 'american_walnut', 'bleached_oak', etc.
 * 2. Visual attributes (swatch color, textures, preview render images)
 * 3. Multi-language dictionary labels: Uzbek (uz), Russian (ru), Turkish (tr), English (en)
 * 4. Deterministic mapping function for reactive product image rendering.
 */

export const WOOD_OPTIONS = [
  {
    id: 'american_walnut',
    color: '#4A2E1B',
    texture: 'radial-gradient(circle at 30% 30%, #5D3B23, #381F10)',
    image_url: '/images/table-walnut.jpg',
    name: {
      ru: 'Американский орех',
      uz: "Amerika yong'og'i",
      tr: 'Amerikan Cevizi',
      en: 'American Walnut'
    },
    sub: {
      ru: 'Шоколадный тон, шелковистый лак',
      uz: "Shokolad rang, ipaksimon lok",
      tr: 'Çikolata tonu, ipeksi mat cila',
      en: 'Dark chocolate tone, satin finish'
    }
  },
  {
    id: 'caucasian_oak',
    color: '#C89B6D',
    texture: 'radial-gradient(circle at 30% 30%, #D8AE82, #9E7448)',
    image_url: '/images/table-oak.jpg',
    name: {
      ru: 'Кавказский дуб',
      uz: 'Kavkaz emani',
      tr: 'Kafkas Meşesi',
      en: 'Caucasian Oak'
    },
    sub: {
      ru: 'Натуральный золотистый, масло Rubio',
      uz: "Tabiiy oltinrang, Rubio moyi",
      tr: 'Doğal altın sarısı, Rubio yağı',
      en: 'Natural golden, Rubio Monocoat'
    }
  },
  {
    id: 'bleached_oak',
    color: '#E5D5C0',
    texture: 'radial-gradient(circle at 30% 30%, #EFE3D3, #C6B39B)',
    image_url: '/images/table-bleached.jpg',
    name: {
      ru: 'Беленый дуб',
      uz: 'Oqlangan eman',
      tr: 'Ağartılmış Meşe',
      en: 'Bleached Oak'
    },
    sub: {
      ru: 'Скандинавский светлый массив',
      uz: "Skandinaviya och massivi",
      tr: 'İskandinav açık masif ahşap',
      en: 'Nordic blonde solid timber'
    }
  },
  {
    id: 'natural_ash',
    color: '#D2BC9B',
    texture: 'radial-gradient(circle at 30% 30%, #E2CCA9, #B09876)',
    image_url: '/images/table-oak.jpg',
    name: {
      ru: 'Натуральный ясень',
      uz: 'Tabiiy shumtol',
      tr: 'Doğal Dişbudak',
      en: 'Natural Ash'
    },
    sub: {
      ru: 'Теплый песочный, прочный массив',
      uz: "Iliq qumrang, pishiq massiv",
      tr: 'Sıcak kum rengi, dayanıklı gövde',
      en: 'Warm sand, high-tensile grain'
    }
  },
  {
    id: 'smoked_oak',
    color: '#2B2119',
    texture: 'radial-gradient(circle at 30% 30%, #3D3025, #17110C)',
    image_url: '/images/table-black.jpg',
    name: {
      ru: 'Мореный дуб',
      uz: 'Dudlangan eman',
      tr: 'Füme Meşe',
      en: 'Smoked Oak'
    },
    sub: {
      ru: 'Темный эспрессо, термо-обработка',
      uz: "To'q espresso, termo-ishlov",
      tr: 'Koyu espresso, ısıl işlem',
      en: 'Dark espresso, thermo-treated'
    }
  },
  {
    id: 'black_graphite',
    color: '#1C1D21',
    texture: 'radial-gradient(circle at 30% 30%, #2E3037, #0D0E11)',
    image_url: '/images/table-black.jpg',
    name: {
      ru: 'Черный графит',
      uz: 'Qora grafit',
      tr: 'Siyah Grafit',
      en: 'Black Graphite'
    },
    sub: {
      ru: 'Матовая открытая пора дерева',
      uz: "Matli ochiq yog'och g'ovagi",
      tr: 'Mat açık gözenekli doku',
      en: 'Matte open-pore texture'
    }
  }
];

export const FABRIC_OPTIONS = [
  {
    id: 'none',
    color: '#2C231B',
    image_url: null,
    name: {
      ru: 'Не требуется (Массив дерева)',
      uz: "Kerak emas (Butun yog'och)",
      tr: 'Gerek yok (Masif ahşap)',
      en: 'None (Solid Wood Only)'
    },
    badge: { ru: 'Массив', uz: "Yog'och", tr: 'Masif', en: 'Solid Wood' }
  },
  {
    id: 'boucle_cream',
    color: '#EDE9E1',
    image_url: '/images/chair-boucle.jpg',
    name: {
      ru: 'Итальянское букле (Кремовый)',
      uz: 'Italiya buklesi (Kremli)',
      tr: 'İtalyan Bukle (Krem)',
      en: 'Italian Boucle (Cream)'
    },
    badge: { ru: 'Букле', uz: 'Bukle', tr: 'Bukle', en: 'Boucle' }
  },
  {
    id: 'boucle_smoke',
    color: '#9E9C99',
    image_url: '/images/chair-boucle.jpg',
    name: {
      ru: 'Итальянское букле (Серый)',
      uz: 'Italiya buklesi (Kulrang)',
      tr: 'İtalyan Bukle (Gri)',
      en: 'Italian Boucle (Smoke Grey)'
    },
    badge: { ru: 'Букле', uz: 'Bukle', tr: 'Bukle', en: 'Boucle' }
  },
  {
    id: 'leather_cognac',
    color: '#8E4A28',
    image_url: '/images/chair-leather.jpg',
    name: {
      ru: 'Анилиновая кожа (Коньячный)',
      uz: 'Anilin charm (Konyak)',
      tr: 'Anilin Deri (Konyak)',
      en: 'Aniline Leather (Cognac)'
    },
    badge: { ru: 'Кожа', uz: 'Charm', tr: 'Deri', en: 'Leather' }
  },
  {
    id: 'leather_black',
    color: '#1E1E1E',
    image_url: '/images/chair-leather.jpg',
    name: {
      ru: 'Натуральная кожа (Черный)',
      uz: 'Tabiiy charm (Qora)',
      tr: 'Doğal Deri (Siyah)',
      en: 'Genuine Leather (Black)'
    },
    badge: { ru: 'Кожа', uz: 'Charm', tr: 'Deri', en: 'Leather' }
  },
  {
    id: 'velvet_emerald',
    color: '#1A453B',
    image_url: '/images/chair-emerald.jpg',
    name: {
      ru: 'Велюр EasyClean (Изумрудный)',
      uz: "Baxmal EasyClean (Zumrad)",
      tr: 'Kadife EasyClean (Zümrüt)',
      en: 'Velvet EasyClean (Emerald)'
    },
    badge: { ru: 'Велюр', uz: 'Baxmal', tr: 'Kadife', en: 'Velvet' }
  },
  {
    id: 'velvet_terracotta',
    color: '#A85338',
    image_url: '/images/chair-terracotta.jpg',
    name: {
      ru: 'Велюр EasyClean (Терракота)',
      uz: 'Baxmal EasyClean (Terrakota)',
      tr: 'Kadife EasyClean (Terakota)',
      en: 'Velvet EasyClean (Terracotta)'
    },
    badge: { ru: 'Велюр', uz: 'Baxmal', tr: 'Kadife', en: 'Velvet' }
  }
];

/**
 * Direct Image Mapping Dictionary by Category and Material ID
 */
export const PRODUCT_IMAGE_MAP = {
  // 1. DINING TABLES & DESKS (e.g. «Montana» table)
  tables: {
    american_walnut: '/images/table-walnut.jpg',
    caucasian_oak: '/images/table-oak.jpg',
    bleached_oak: '/images/table-bleached.jpg',
    natural_ash: '/images/table-oak.jpg',
    smoked_oak: '/images/table-black.jpg',
    black_graphite: '/images/table-black.jpg'
  },

  // 2. CHAIRS, LOUNGES, ARMCHAIRS, SOFAS
  chairs: {
    // Fabric mappings
    boucle_cream: '/images/chair-boucle.jpg',
    boucle_smoke: '/images/chair-boucle.jpg',
    leather_cognac: '/images/chair-leather.jpg',
    leather_black: '/images/chair-leather.jpg',
    velvet_emerald: '/images/chair-emerald.jpg',
    velvet_terracotta: '/images/chair-terracotta.jpg',
    // Wood mappings fallback
    american_walnut: '/images/chair-leather.jpg',
    caucasian_oak: '/images/chair-boucle.jpg',
    bleached_oak: '/images/chair-boucle.jpg',
    natural_ash: '/images/chair-boucle.jpg',
    smoked_oak: '/images/chair-leather.jpg',
    black_graphite: '/images/chair-leather.jpg'
  },

  // 3. WARDROBES & STORAGE
  wardrobes: {
    american_walnut: '/images/wardrobe-oak.jpg',
    caucasian_oak: '/images/wardrobe-oak.jpg',
    bleached_oak: '/images/wardrobe-oak.jpg',
    natural_ash: '/images/wardrobe-oak.jpg',
    smoked_oak: '/images/table-black.jpg',
    black_graphite: '/images/table-black.jpg'
  },

  // 4. DOORS
  doors: {
    caucasian_oak: '/images/door-oak.jpg',
    american_walnut: '/images/door-oak.jpg',
    bleached_oak: '/images/door-oak.jpg',
    natural_ash: '/images/door-oak.jpg',
    smoked_oak: '/images/door-oak.jpg',
    black_graphite: '/images/door-oak.jpg'
  }
};

/**
 * Normalizes an incoming ID by stripping prefixes if any
 */
export function normalizeMaterialId(id) {
  if (!id) return '';
  return id.replace(/^wood_/, '').replace(/^fabric_/, '');
}

/**
 * Resolves the primary display image dynamically and synchronously.
 *
 * @param {Object} product - Original product object
 * @param {string} woodId - Material slug (e.g. 'american_walnut', 'bleached_oak')
 * @param {string} fabricId - Material slug (e.g. 'none', 'velvet_emerald')
 * @returns {string} Image URL path
 */
export function getProductImage(product, woodId, fabricId) {
  if (!product) return '/images/table-walnut.jpg';

  const cat = (product.category || '').toLowerCase();
  const cleanWood = normalizeMaterialId(woodId);
  const cleanFabric = normalizeMaterialId(fabricId);

  // 1. DINING TABLES
  if (cat.includes('стол') || cat.includes('table') || cat.includes('stollar') || cat.includes('masa')) {
    if (cleanWood && PRODUCT_IMAGE_MAP.tables[cleanWood]) {
      return PRODUCT_IMAGE_MAP.tables[cleanWood];
    }
    return product.image_url || '/images/table-walnut.jpg';
  }

  // 2. CHAIRS & UPHOLSTERY
  if (
    cat.includes('стул') ||
    cat.includes('диван') ||
    cat.includes('chair') ||
    cat.includes('sofa') ||
    cat.includes('stullar') ||
    cat.includes('sandalye')
  ) {
    if (cleanFabric && cleanFabric !== 'none' && PRODUCT_IMAGE_MAP.chairs[cleanFabric]) {
      return PRODUCT_IMAGE_MAP.chairs[cleanFabric];
    }
    if (cleanWood && PRODUCT_IMAGE_MAP.chairs[cleanWood]) {
      return PRODUCT_IMAGE_MAP.chairs[cleanWood];
    }
    return product.image_url || '/images/chair-leather.jpg';
  }

  // 3. WARDROBES
  if (cat.includes('шкаф') || cat.includes('wardrobe') || cat.includes('shkaf') || cat.includes('dolap')) {
    if (cleanWood && PRODUCT_IMAGE_MAP.wardrobes[cleanWood]) {
      return PRODUCT_IMAGE_MAP.wardrobes[cleanWood];
    }
    return product.image_url || '/images/wardrobe-oak.jpg';
  }

  // 4. DOORS
  if (cat.includes('двер') || cat.includes('door') || cat.includes('eshik') || cat.includes('kapi')) {
    if (cleanWood && PRODUCT_IMAGE_MAP.doors[cleanWood]) {
      return PRODUCT_IMAGE_MAP.doors[cleanWood];
    }
    return product.image_url || '/images/door-oak.jpg';
  }

  // Fallback
  return product.image_url || '/images/table-walnut.jpg';
}

// Backward compatibility alias
export const resolveProductImage = getProductImage;
