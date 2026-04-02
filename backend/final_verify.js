const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/RealEstste';

async function update() {
  try {
    await mongoose.connect(MONGO_URI);
    const u = await User.findOne({ email: 'vrund@gmail.com' });
    if(u) {
      u.status = 'active'; // Middleware blocks based on suspendedUntil
      u.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); 
      u.suspensionDurationLabel = '24 Hour';
      await u.save();
      console.log('Final Update: vrund@gmail.com now suspended for 24 Hour until tomorrow.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

update();
