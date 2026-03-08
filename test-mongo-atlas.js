import { MongoClient } from 'mongodb';

// Test MongoDB Atlas connection
const testMongoConnection = async () => {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  // Get connection string from environment or use placeholder
  const uri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/unsaid-archive?retryWrites=true&w=majority';
  
  if (uri.includes('username:password')) {
    console.log('❌ Please update MONGODB_URI with your actual Atlas credentials');
    console.log('📖 Follow: MONGODB_GITHUB_SETUP.md for setup instructions\n');
    return false;
  }
  
  const client = new MongoClient(uri);
  
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!\n');
    
    // Test database operations
    const database = client.db('unsaid-archive');
    
    // List collections
    console.log('📁 Checking collections...');
    const collections = await database.listCollections().toArray();
    console.log('📋 Existing collections:', collections.map(c => c.name));
    
    // Test write operation
    console.log('\n✍️ Testing write operation...');
    const testCollection = database.collection('test');
    const testDoc = {
      message: 'MongoDB Atlas connection test',
      timestamp: new Date(),
      deployment: 'github-ready'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful, ID:', result.insertedId);
    
    // Test read operation
    console.log('\n📖 Testing read operation...');
    const found = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Read operation successful:', found.message);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas is ready for GitHub deployment.');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 Check your username/password in the connection string');
    } else if (error.message.includes('IP')) {
      console.log('💡 Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your cluster name and MongoDB Atlas URL');
    }
    
    return false;
    
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
};

// Run the test
testMongoConnection().then(success => {
  process.exit(success ? 0 : 1);
});
