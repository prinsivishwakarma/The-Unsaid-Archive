import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { connectDB, getWhispersCollection, getClustersCollection } from '../backend/db-mongo.js';
import { embedAndCluster } from '../backend/embeddings.js';

// Vercel configuration
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'https://your-domain.vercel.app';
const WHISPER_MIN_LENGTH = 4;
const WHISPER_MAX_LENGTH = 160;

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Performance middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://your-domain.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['polling', 'websocket'] // Enable both for Vercel compatibility
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// API Routes
app.get('/api/whispers', async (req, res) => {
  try {
    const [whispers, clusters] = await Promise.all([
      getWhispersCollection()
        .find({})
        .sort({ created_at: 1 })
        .project({ text: 1, cluster: 1, created_at: 1 })
        .limit(1000)
        .toArray(),
      getClustersCollection().find({}).toArray()
    ]);
    
    res.json({ whispers, clusters });
  } catch (error) {
    console.error('Error fetching whispers:', error);
    res.status(500).json({ error: 'Failed to fetch whispers' });
  }
});

app.post('/api/whisper', async (req, res) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string' || text.trim().length < WHISPER_MIN_LENGTH || text.trim().length > WHISPER_MAX_LENGTH) {
    return res.status(400).json({ error: `Text must be between ${WHISPER_MIN_LENGTH} and ${WHISPER_MAX_LENGTH} characters` });
  }
  
  try {
    const { cluster, embedding, scores } = await embedAndCluster(text.trim());
    
    const newWhisper = {
      text: text.trim(),
      cluster,
      embedding,
      created_at: new Date()
    };
    
    const result = await getWhispersCollection().insertOne(newWhisper);
    
    const responseWhisper = {
      id: result.insertedId.toString(),
      text: text.trim(),
      cluster,
      created_at: newWhisper.created_at.toISOString()
    };
    
    io.emit('new_whisper', responseWhisper);
    
    res.json({ 
      success: true, 
      whisper: responseWhisper, 
      clusterScores: scores 
    });
    
  } catch (error) {
    console.error('Error processing whisper:', error);
    res.status(500).json({ error: 'Failed to process whisper' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getWhispersCollection().aggregate([
      { $group: { _id: '$cluster', count: { $sum: 1 } } },
      { $project: { cluster: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Socket.io event handlers
io.on('connection', async (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  try {
    const total = await getWhispersCollection().countDocuments();
    socket.emit('stats', { 
      total, 
      connected: io.engine.clientsCount 
    });
  } catch (error) {
    console.error('Error fetching initial stats:', error.message);
  }
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
export default app;
export { io, httpServer };

// For local development
if (process.env.NODE_ENV !== 'production') {
  startServer();
}

async function startServer() {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🌑 The Unsaid Archive - Vercel Server Ready`);
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`📡 Socket.io: Active`);
      console.log(`🍃 MongoDB: Connected`);
      console.log(`✅ Ready to receive whispers\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}
