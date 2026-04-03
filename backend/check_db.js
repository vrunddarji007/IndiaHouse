const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }
  
  await mongoose.connect(uri);
  console.log('Connected to DB');
  
  const lastFive = await Property.find().sort({ createdAt: -1 }).limit(5);
  console.log(`Found ${lastFive.length} properties`);
  lastFive.forEach(p => {
    console.log(`Property: ${p.title} (${p._id})`);
    console.log(`  Location: ${p.location}, State: ${p.state}`);
    console.log(`  Town: ${p.town || 'EMPTY'}`);
    console.log(`  Village: ${p.village || 'EMPTY'}`);
    console.log('---');
  });
  
  process.exit();
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
