import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB, getWhispersCollection, getClustersCollection } from './db-mongo.js';
import { embedAndCluster } from './embeddings.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── GET all whispers (on page load) ──
app.get('/api/whispers', async (req, res) => {
  try {
    const whispersCollection = getWhispersCollection();
    const clustersCollection = getClustersCollection();
    
    const whispers = await whispersCollection
      .find({})
      .sort({ created_at: 1 })
      .project({ text: 1, cluster: 1, created_at: 1 })
      .toArray();
    
    const clusters = await clustersCollection.find({}).toArray();
    res.json({ whispers, clusters });
  } catch (error) {
    console.error('Error fetching whispers:', error);
    res.status(500).json({ error: 'Failed to fetch whispers' });
  }
});

// ── POST new whisper ──
app.post('/api/whisper', async (req, res) => {
  const { text } = req.body;

  // Validate
  if (!text || text.trim().length < 4 || text.length > 160) {
    return res.status(400).json({ error: 'Invalid whisper length.' });
  }

  try {
    // 1. Embed + cluster (the AI magic)
    const { cluster, embedding, scores } = await embedAndCluster(text.trim());

    // 2. Persist to MongoDB
    const whispersCollection = getWhispersCollection();
    const newWhisper = {
      text: text.trim(),
      cluster,
      embedding,
      created_at: new Date()
    };
    
    const result = await whispersCollection.insertOne(newWhisper);
    
    const responseWhisper = {
      id: result.insertedId.toString(),
      text: text.trim(),
      cluster,
      created_at: newWhisper.created_at.toISOString(),
    };

    // 3. Broadcast to ALL connected clients via Socket.io
    io.emit('new_whisper', responseWhisper);

    // 4. Respond to submitting client
    res.json({ success: true, whisper: responseWhisper, clusterScores: scores });

  } catch (err) {
    console.error('Embedding error:', err.message);
    res.status(500).json({ error: 'Failed to process whisper.' });
  }
});

// ── GET cluster stats ──
app.get('/api/stats', async (req, res) => {
  try {
    const whispersCollection = getWhispersCollection();
    const stats = await whispersCollection.aggregate([
      { $group: { _id: '$cluster', count: { $sum: 1 } } },
      { $project: { cluster: '$_id', count: 1, _id: 0 } }
    ]).toArray();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── Socket.io connection tracking ──
io.on('connection', async (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send current whisper count on connect
  try {
    const whispersCollection = getWhispersCollection();
    const total = await whispersCollection.countDocuments();
    socket.emit('stats', { total, connected: io.engine.clientsCount });
  } catch (error) {
    console.error('Error getting whisper count:', error);
  }

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

// Start server after MongoDB connection
async function startServer() {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`\n🌑 The Unsaid Archive — Backend running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io active`);
      console.log(`🍃 MongoDB connected`);
      console.log(`🧠 Smart keyword clustering active (no OpenAI required)\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
