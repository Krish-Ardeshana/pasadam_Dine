/**
 * PRASADAM DINE — Real Food 3D Model Library & Catalog
 * Centralized registry of realistic, food-specific 3D models with license and display configuration.
 */

export interface FoodModelMeta {
  id: string;
  foodName: string;
  category: string;
  glbUrl: string;
  usdzUrl?: string; // For Apple AR Quick Look on iOS Safari
  thumbnailUrl: string;
  description: string;
  fileSizeFormatted: string;
  sizeBytes: number;
  source: string;
  license: string;
  licenseUrl: string;
  author: string;
  status: 'VERIFIED' | 'COMING_SOON';
  scaleConfig: {
    cameraOrbit?: string;
    fieldOfView?: string;
    exposure?: string;
    shadowIntensity?: string;
    shadowSoftness?: string;
    arScale?: 'auto' | 'fixed';
  };
}

export const FOOD_MODEL_CATALOG: FoodModelMeta[] = [
  {
    id: 'pizza-margherita',
    foodName: 'Artisan Margherita Pizza',
    category: 'Pizza and Fast Food',
    glbUrl: '/models/pizza.glb',
    usdzUrl: '/models/pizza.usdz',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Crisp wood-fired pizza with bubbling mozzarella, rich marinara sauce, and fresh basil leaves.',
    fileSizeFormatted: '7.47 MB',
    sizeBytes: 7469820,
    source: 'haydermuhib/google-model-viewer-pizza',
    license: 'MIT / Open Source 3D',
    licenseUrl: 'https://github.com/haydermuhib/google-model-viewer-pizza',
    author: 'Hayder Muhib',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '0deg 60deg 1.2m',
      fieldOfView: '30deg',
      exposure: '1.0',
      shadowIntensity: '1.2',
      shadowSoftness: '0.6',
      arScale: 'auto',
    },
  },
  {
    id: 'burger-gourmet',
    foodName: 'Gourmet Sesame Veggie Burger',
    category: 'Burgers and Sandwiches',
    glbUrl: '/models/burger.glb',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Stacked sesame-crusted bun with melted cheddar, crisp lettuce, tomato slices, and grilled patty.',
    fileSizeFormatted: '3.52 MB',
    sizeBytes: 3521888,
    source: 'mindset-code/burger-house-3d',
    license: 'MIT License',
    licenseUrl: 'https://github.com/mindset-code/burger-house-3d',
    author: 'Mindset Code (3D Food Prop)',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '45deg 70deg 1.1m',
      fieldOfView: '35deg',
      exposure: '1.1',
      shadowIntensity: '1.3',
      shadowSoftness: '0.7',
      arScale: 'auto',
    },
  },
  {
    id: 'rice-biryani',
    foodName: 'Hyderabadi Dum Biryani / Spiced Rice',
    category: 'Rice and Biryani',
    glbUrl: '/models/biryani_rice.glb',
    thumbnailUrl: '/images/biryani_ar.jpg',
    description: 'Fragrant basmati rice slow-cooked with saffron, caramelized onions, whole spices, and herbs.',
    fileSizeFormatted: '6.28 MB',
    sizeBytes: 6279600,
    source: 'Velskins/O-Bistrot_Carte_WebAR (Risotto Asset)',
    license: 'Creative Commons Attribution / WebAR Open Model',
    licenseUrl: 'https://github.com/Velskins/O-Bistrot_Carte_WebAR',
    author: 'Velskins WebAR Studio',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '30deg 55deg 1.3m',
      fieldOfView: '32deg',
      exposure: '1.05',
      shadowIntensity: '1.2',
      shadowSoftness: '0.8',
      arScale: 'auto',
    },
  },
  {
    id: 'dal-curry-tadka',
    foodName: 'Traditional Dal Tadka & Curry Platter',
    category: 'Gujarati & Punjabi Food',
    glbUrl: '/models/dal_curry.glb',
    thumbnailUrl: '/images/dal_makhani.jpg',
    description: 'Aromatic yellow lentil curry tempered with cumin, garlic, and pure ghee in a presentation bowl.',
    fileSizeFormatted: '1.91 MB',
    sizeBytes: 1906460,
    source: 'Velskins/O-Bistrot_Carte_WebAR (Soupe Bowl Asset)',
    license: 'Creative Commons Attribution / WebAR Open Model',
    licenseUrl: 'https://github.com/Velskins/O-Bistrot_Carte_WebAR',
    author: 'Velskins WebAR Studio',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '0deg 50deg 1.2m',
      fieldOfView: '30deg',
      exposure: '1.0',
      shadowIntensity: '1.1',
      shadowSoftness: '0.8',
      arScale: 'auto',
    },
  },
  {
    id: 'badam-halwa-dessert',
    foodName: 'Royal Saffron Badam Halwa / Crème Dessert',
    category: 'Desserts',
    glbUrl: '/models/halwa_dessert.glb',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Golden almond pudding slow-roasted in pure ghee, infused with saffron strands and pistachios.',
    fileSizeFormatted: '4.75 MB',
    sizeBytes: 4751880,
    source: 'Velskins/O-Bistrot_Carte_WebAR (Crème Brûlée Asset)',
    license: 'Creative Commons Attribution / WebAR Open Model',
    licenseUrl: 'https://github.com/Velskins/O-Bistrot_Carte_WebAR',
    author: 'Velskins WebAR Studio',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '15deg 60deg 1.0m',
      fieldOfView: '30deg',
      exposure: '1.0',
      shadowIntensity: '1.2',
      shadowSoftness: '0.5',
      arScale: 'auto',
    },
  },
  {
    id: 'chocolate-mousse-cake',
    foodName: 'Belgian Chocolate Truffle Mousse Cake',
    category: 'Cakes and Bakery',
    glbUrl: '/models/chocolate_cake.glb',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Decadent multi-layered dark chocolate sponge with velvety ganache and cocoa drizzle.',
    fileSizeFormatted: '4.57 MB',
    sizeBytes: 4568488,
    source: 'Velskins/O-Bistrot_Carte_WebAR (Mousse Asset)',
    license: 'Creative Commons Attribution / WebAR Open Model',
    licenseUrl: 'https://github.com/Velskins/O-Bistrot_Carte_WebAR',
    author: 'Velskins WebAR Studio',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '45deg 65deg 1.0m',
      fieldOfView: '32deg',
      exposure: '1.0',
      shadowIntensity: '1.4',
      shadowSoftness: '0.6',
      arScale: 'auto',
    },
  },
  {
    id: 'paneer-tikka-starter',
    foodName: 'Spiced Paneer Tikka / Appetizer Platter',
    category: 'Indian Starters',
    glbUrl: '/models/paneer_tikka_platter.glb',
    thumbnailUrl: '/images/paneer_butter_masala.jpg',
    description: 'Ceramic appetizer dish laden with marinated, roasted morsels, spices, and garnishes.',
    fileSizeFormatted: '5.74 MB',
    sizeBytes: 5742828,
    source: 'Khronos Group glTF Sample Assets (IridescentDishWithOlives)',
    license: 'CC0 1.0 Universal (Public Domain)',
    licenseUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/IridescentDishWithOlives',
    author: 'Khronos Group 3D Formats Working Group',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '0deg 55deg 1.2m',
      fieldOfView: '30deg',
      exposure: '1.0',
      shadowIntensity: '1.2',
      shadowSoftness: '0.7',
      arScale: 'auto',
    },
  },
  {
    id: 'garden-kachumber-salad',
    foodName: 'Fresh Garden Kachumber Salad Bowl',
    category: 'Indian Starters',
    glbUrl: '/models/salad_bowl.glb',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Light and crisp seasonal garden salad with diced cucumbers, tomatoes, greens, and lemon dressing.',
    fileSizeFormatted: '105 KB',
    sizeBytes: 105320,
    source: 'Velskins/O-Bistrot_Carte_WebAR (Salad_Bowl Asset)',
    license: 'Creative Commons Attribution / WebAR Open Model',
    licenseUrl: 'https://github.com/Velskins/O-Bistrot_Carte_WebAR',
    author: 'Velskins WebAR Studio',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '20deg 60deg 1.1m',
      fieldOfView: '35deg',
      exposure: '1.0',
      shadowIntensity: '1.0',
      shadowSoftness: '0.6',
      arScale: 'auto',
    },
  },
  {
    id: 'masala-chai-coffee',
    foodName: 'Steaming Masala Chai / Artisan Coffee Cup',
    category: 'Beverages',
    glbUrl: '/models/masala_chai.glb',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Fine porcelain tea cup filled with steaming aromatic spiced cardamom tea / freshly brewed espresso.',
    fileSizeFormatted: '4.80 MB',
    sizeBytes: 4795028,
    source: 'Khronos Group glTF Sample Assets (DiffuseTransmissionTeacup)',
    license: 'CC0 1.0 Universal (Public Domain)',
    licenseUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/DiffuseTransmissionTeacup',
    author: 'Khronos Group 3D Formats Working Group',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '0deg 60deg 0.8m',
      fieldOfView: '28deg',
      exposure: '1.0',
      shadowIntensity: '1.2',
      shadowSoftness: '0.5',
      arScale: 'auto',
    },
  },
  {
    id: 'packaged-mineral-water',
    foodName: 'Pure Spring Mineral Water Bottle',
    category: 'Beverages',
    glbUrl: '/models/water_bottle.glb',
    thumbnailUrl: '/images/hero_thali.jpg',
    description: 'Chilled spring mineral water bottle with condensation and realistic refractive transparency.',
    fileSizeFormatted: '8.97 MB',
    sizeBytes: 8966700,
    source: 'Khronos Group glTF Sample Assets (WaterBottle)',
    license: 'CC0 1.0 Universal (Public Domain)',
    licenseUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/WaterBottle',
    author: 'Khronos Group 3D Formats Working Group',
    status: 'VERIFIED',
    scaleConfig: {
      cameraOrbit: '0deg 75deg 1.2m',
      fieldOfView: '30deg',
      exposure: '1.0',
      shadowIntensity: '1.0',
      shadowSoftness: '0.7',
      arScale: 'auto',
    },
  },
];

/**
 * Find a catalog model by exact URL or food slug/ID
 */
export function findFoodModelByUrl(url?: string): FoodModelMeta | undefined {
  if (!url) return undefined;
  const cleanUrl = url.trim().toLowerCase();
  return FOOD_MODEL_CATALOG.find(
    (m) =>
      cleanUrl.includes(m.glbUrl.toLowerCase()) ||
      cleanUrl.endsWith(m.id.toLowerCase()) ||
      cleanUrl.includes(m.id.toLowerCase())
  );
}

/**
 * Find appropriate food model for a dish based on name/category keywords
 */
export function suggestModelForDish(dishName: string, categoryName: string = ''): FoodModelMeta | undefined {
  const text = `${dishName} ${categoryName}`.toLowerCase();

  if (text.includes('pizza')) return FOOD_MODEL_CATALOG.find((m) => m.id === 'pizza-margherita');
  if (text.includes('burger')) return FOOD_MODEL_CATALOG.find((m) => m.id === 'burger-gourmet');
  if (text.includes('biryani') || text.includes('pulao') || text.includes('rice'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'rice-biryani');
  if (text.includes('dal') || text.includes('curry') || text.includes('thali') || text.includes('sambhar'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'dal-curry-tadka');
  if (text.includes('halwa') || text.includes('kheer') || text.includes('gulab') || text.includes('sweet'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'badam-halwa-dessert');
  if (text.includes('cake') || text.includes('pastry') || text.includes('mousse') || text.includes('chocolate'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'chocolate-mousse-cake');
  if (text.includes('paneer') || text.includes('tikka') || text.includes('starter') || text.includes('snack'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'paneer-tikka-starter');
  if (text.includes('salad') || text.includes('kachumber') || text.includes('raita'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'garden-kachumber-salad');
  if (text.includes('chai') || text.includes('tea') || text.includes('coffee'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'masala-chai-coffee');
  if (text.includes('water') || text.includes('beverage') || text.includes('drink') || text.includes('soda'))
    return FOOD_MODEL_CATALOG.find((m) => m.id === 'packaged-mineral-water');

  return undefined;
}
