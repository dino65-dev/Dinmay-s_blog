const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'dinmay_blog';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('Connection string:', uri.replace(/:[^:]*@/, ':****@'));
  console.log('Database name:', dbName);
  
  let client;
  try {
    client = await MongoClient.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log('✓ Successfully connected to MongoDB!');
    
    const db = client.db(dbName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nExisting collections:', collections.map(c => c.name).join(', ') || 'none');
    
    // Try to insert a test document
    console.log('\nTesting insert operation...');
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({
      test: 'Hello from Next.js blog!',
      timestamp: new Date()
    });
    console.log('✓ Test document inserted with ID:', result.insertedId);
    
    // Read it back
    const doc = await testCollection.findOne({ _id: result.insertedId });
    console.log('✓ Test document retrieved:', doc);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✓ Test document deleted');
    
    console.log('\n✅ All MongoDB operations successful!');
    console.log('Your Next.js blog is now connected to Azure Cosmos DB (MongoDB API)');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✓ Connection closed');
    }
  }
}

testConnection();
