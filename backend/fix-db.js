const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const collection = mongoose.connection.collection('users');

    // 1. Remove the field 'phone' from any document where it is explicitly null
    console.log('Cleaning up null phone fields...');
    const result = await collection.updateMany(
      { phone: null },
      { $unset: { phone: "" } }
    );
    console.log(`Updated ${result.modifiedCount} documents.`);

    // 2. Drop the existing 'phone' index if it exists
    console.log('Dropping old phone index...');
    try {
      await collection.dropIndex('phone_1');
      console.log('Dropped phone_1 index.');
    } catch (e) {
      console.log('Index phone_1 not found or already dropped.');
    }

    // 3. Re-create the index as unique AND sparse
    console.log('Creating unique sparse index for phone...');
    await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Index created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error during DB fix:', error);
    process.exit(1);
  }
};

fixDatabase();
