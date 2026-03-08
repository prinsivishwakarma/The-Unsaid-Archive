import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { connectDB, getWhispersCollection, getClustersCollection } from './db-mongo.js';
import { embedAndCluster } from './embeddings.js';

// Production configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'http://localhost:5173';
const WHISPER_MIN_LENGTH = 4;
const WHISPER_MAX_LENGTH = 160;

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// Performance middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: corsOptions
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
/**
 * GET /api/whispers - Fetch all whispers and cluster themes
 */
app.get('/api/whispers', async (req, res) => {
  try {
    const [whispers, clusters] = await Promise.all([
      getWhispersCollection()
        .find({})
        .sort({ created_at: 1 })
        .project({ text: 1, cluster: 1, created_at: 1 })
        .limit(1000) // Limit for performance
        .toArray(),
      getClustersCollection().find({}).toArray()
    ]);
    
    res.json({ whispers, clusters });
  } catch (error) {
    console.error('Error fetching whispers:', error);
    res.status(500).json({ error: 'Failed to fetch whispers' });
  }
});

/**
 * POST /api/whisper - Submit a new whisper
 */
app.post('/api/whisper', async (req, res) => {
  const { text } = req.body;
  
  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length < WHISPER_MIN_LENGTH || text.trim().length > WHISPER_MAX_LENGTH) {
    return res.status(400).json({ error: `Text must be between ${WHISPER_MIN_LENGTH} and ${WHISPER_MAX_LENGTH} characters` });
  }
  
  try {
    // Process and cluster the whisper
    const { cluster, embedding, scores } = await embedAndCluster(text.trim());
    
    // Save to database
    const newWhisper = {
      text: text.trim(),
      cluster,
      embedding,
      created_at: new Date()
    };
    
    const result = await getWhispersCollection().insertOne(newWhisper);
    
    // Prepare response
    const responseWhisper = {
      id: result.insertedId.toString(),
      text: text.trim(),
      cluster,
      created_at: newWhisper.created_at.toISOString()
    };
    
    // Broadcast to all connected clients
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

/**
 * GET /api/stats - Get cluster statistics
 */
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
  
  // Send initial stats
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

// Serve static files in production
if (NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  
  app.get('*', (req, res) => {
    res.sendFile('../frontend/dist/index.html');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup
async function startServer() {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`\n🌑 The Unsaid Archive - Production`);
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`📡 Socket.io: Active`);
      console.log(`🍃 MongoDB: Connected`);
      console.log(`🧠 Clustering: Smart keyword analysis`);
      console.log(`🔒 Security: Enabled`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`✅ Ready to receive whispers\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});

// Start the server
startServer();
