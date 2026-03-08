import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let whispersCollection;
let clustersCollection;

export async function connectDB() {
  try {
    await client.connect();
    console.log('🍃 Connected to MongoDB');
    
    const db = client.db('unsaid-archive');
    whispersCollection = db.collection('whispers');
    clustersCollection = db.collection('cluster_centroids');
    
    await whispersCollection.createIndex({ created_at: -1 });
    await whispersCollection.createIndex({ cluster: 1 });
    
    const clusterCount = await clustersCollection.countDocuments();
    if (clusterCount === 0) {
      const clusters = [
        { cluster_key: 'work',    label: 'Workplace',     color: '#e8a0bf', centroid_x: 0.25, centroid_y: 0.30 },
        { cluster_key: 'body',    label: 'Body',          color: '#a78bfa', centroid_x: 0.75, centroid_y: 0.25 },
        { cluster_key: 'home',    label: 'Home & Family', color: '#f59e7a', centroid_x: 0.22, centroid_y: 0.72 },
        { cluster_key: 'anger',   label: 'Anger',         color: '#fb7185', centroid_x: 0.78, centroid_y: 0.68 },
        { cluster_key: 'dream',   label: 'Ambition',      color: '#67e8f9', centroid_x: 0.50, centroid_y: 0.18 },
        { cluster_key: 'love',    label: 'Love',          color: '#f0abfc', centroid_x: 0.82, centroid_y: 0.45 },
        { cluster_key: 'worth',   label: 'Self-Worth',    color: '#86efac', centroid_x: 0.18, centroid_y: 0.50 },
        { cluster_key: 'voice',   label: 'Voice',         color: '#fde68a', centroid_x: 0.50, centroid_y: 0.80 },
      ];
      await clustersCollection.insertMany(clusters);
      console.log('✅ Cluster centroids seeded');
    }
    
    return { whispersCollection, clustersCollection };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export function getWhispersCollection() {
  return whispersCollection;
}

export function getClustersCollection() {
  return clustersCollection;
}
