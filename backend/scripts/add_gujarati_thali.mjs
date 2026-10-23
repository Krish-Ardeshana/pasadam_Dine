import mongoose from 'mongoose';

const uris = [
  'mongodb+srv://24cs007_db_user:D1YNUSjeHuMENq3B@cluster0.junnzwj.mongodb.net/prasadam_dine?retryWrites=true&w=majority&appName=Cluster0',
  'mongodb://127.0.0.1:27017/prasadam_dine'
];

async function main() {
  for (const uri of uris) {
    const isCloud = uri.includes('mongodb+srv');
    try {
      console.log('Connecting to:', isCloud ? 'Atlas Cloud DB' : 'Local MongoDB');
      const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 8000 }).asPromise();
      const Restaurant = conn.model('Restaurant', new mongoose.Schema({}, { strict: false }));
      const Category = conn.model('Category', new mongoose.Schema({}, { strict: false }));
      const Dish = conn.model('Dish', new mongoose.Schema({}, { strict: false }));

      const restaurant = (await Restaurant.findOne({ slug: 'prasadam-divine' })) || (await Restaurant.findOne({}));
      if (!restaurant) {
        console.log('No restaurant found on', isCloud ? 'Atlas' : 'Local');
        await conn.close();
        continue;
      }

      let category = await Category.findOne({ restaurantId: restaurant._id, name: /Thali/i });
      if (!category) {
        category = await Category.findOne({ restaurantId: restaurant._id });
      }

      const dishData = {
        name: 'Special Gujarati Thali',
        slug: 'special-gujarati-thali',
        restaurantId: restaurant._id,
        categoryId: category ? category._id : null,
        price: 16.99,
        currency: 'USD',
        description: 'Authentic Kathiyawadi Gujarati Thali feast featuring Ringna No Oro, Gujarati Dal, Kadhi, Phulka Roti, Bajra No Rotlo, Khaman Dhokla, Shrikhand, and Chhas.',
        isAvailable: true,
        isPublished: true,
        dietaryFlags: ['Pure Vegetarian', 'Satvik', 'Gujarati Special'],
        imageUrls: ['/images/gujarati_thali.jpg', '/images/hero_thali.jpg'],
        model3dUrl: '/models/gujarati_thali.glb',
        displayOrder: 0
      };

      const existing = await Dish.findOne({ restaurantId: restaurant._id, slug: 'special-gujarati-thali' });
      if (existing) {
        await Dish.updateOne({ _id: existing._id }, { $set: dishData });
        console.log('Successfully updated Special Gujarati Thali on', isCloud ? 'Atlas Cloud' : 'Local');
      } else {
        const created = await Dish.create(dishData);
        console.log('Successfully created Special Gujarati Thali on', isCloud ? 'Atlas Cloud' : 'Local', 'ID:', created._id);
      }

      // Also ensure any dish named 'Gujarati Thali' or 'maharaja-devotional-thali' has model3dUrl populated
      await Dish.updateMany(
        { restaurantId: restaurant._id, name: /Gujarati/i },
        { $set: { model3dUrl: '/models/gujarati_thali.glb', isAvailable: true, isPublished: true } }
      );

      const allDishes = await Dish.find({ restaurantId: restaurant._id }, 'name slug isPublished isAvailable model3dUrl');
      console.log('Total dishes on', isCloud ? 'Atlas Cloud' : 'Local', ':', allDishes.length);
      allDishes.forEach(d => console.log(' -', d.name, '| slug:', d.slug, '| published:', d.isPublished, '| model:', d.model3dUrl));

      await conn.close();
    } catch (err) {
      console.log('Error with', isCloud ? 'Atlas Cloud' : 'Local', ':', err.message);
    }
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
