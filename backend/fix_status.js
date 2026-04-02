const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const r = await mongoose.connection.db.collection('properties').updateMany(
    { status: 'pending' },
    { $set: { status: 'active' } }
  );
  console.log('Updated', r.modifiedCount, 'properties from pending to active');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
