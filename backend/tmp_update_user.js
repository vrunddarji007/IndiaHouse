const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/RealEstste';

async function update() {
  try {
    await mongoose.connect(MONGO_URI);
    const u = await User.findOne({ email: 'vrund@gmail.com' });
    if(u) {
      u.suspensionDurationLabel = '24 Hour';
      await u.save();
      console.log('Updated user vrund@gmail.com with duration label "24 Hour"');
    } else {
      console.log('User vrund@gmail.com not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

update();
