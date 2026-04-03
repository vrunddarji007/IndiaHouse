const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  // Update all properties that have empty town/village with placeholder values
  const props = await Property.find();
  for (const p of props) {
    if (!p.town && !p.village) {
      // Set town and village based on location
      p.town = 'dahod';
      p.village = 'dahod';
      await p.save();
      console.log(`Updated: ${p.title} -> Town: ${p.town}, Village: ${p.village}`);
    }
  }
  
  console.log('Done! All properties updated.');
  process.exit();
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
