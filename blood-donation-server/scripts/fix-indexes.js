const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully.');

        const collection = mongoose.connection.collection('inventories');
        
        console.log('Checking indexes in collection: inventories...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        for (const index of indexes) {
            // Drop any single field unique index on bloodType or hospital
            if (index.name !== '_id_' && index.name !== 'hospital_1_bloodType_1') {
                console.log(`Dropping problematic index ${index.name}...`);
                try {
                    await collection.dropIndex(index.name);
                    console.log(`Index ${index.name} dropped.`);
                } catch (e) {
                    console.error(`Failed to drop index ${index.name}:`, e.message);
                }
            }
        }

        console.log('Ensuring compound index { hospital: 1, bloodType: 1 } exists...');
        await collection.createIndex({ hospital: 1, bloodType: 1 }, { unique: true });
        console.log('Compound index verified/created.');

        console.log('Final index list:');
        const finalIndexes = await collection.indexes();
        console.log(JSON.stringify(finalIndexes, null, 2));

        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
