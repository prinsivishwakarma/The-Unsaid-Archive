# The Unsaid Archive

A real-time anonymous archive for International Women's Day 2026 where women can submit one sentence they were never allowed to say — at work, at home, in society.

## Architecture

**Backend**: Node.js + Express + Socket.io + SQLite + OpenAI Embeddings  
**Frontend**: React + Vite + Canvas API + Socket.io-client  
**AI Clustering**: OpenAI text-embedding-3-small with cosine similarity

### How it works

1. User submits a sentence → Node.js sends it to OpenAI's embedding model
2. The resulting 1536-dimensional vector is compared via cosine similarity against 8 pre-embedded cluster centroids
3. The closest theme wins → Whisper is stored in SQLite with cluster assignment
4. Socket.io broadcasts the result to every connected browser in real-time
5. Canvas renders floating whispers that glow brighter when clustered together

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `.env` file:
```
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=3001
```

Start the server:
```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Cluster Themes

- **Workplace** (#e8a0bf) - Career suppression, meeting silencing, gender bias
- **Body** (#a78bfa) - Appearance judgement, beauty standards, clothing policing  
- **Home & Family** (#f59e7a) - Domestic expectations, traditional roles, parenting inequality
- **Anger** (#fb7185) - Suppressed rage, emotional labor, exhaustion from oppression
- **Ambition** (#67e8f9) - Abandoned dreams, dismissed aspirations, gender barriers
- **Love** (#f0abfc) - Silenced feelings, toxic relationships, conditional love
- **Self-Worth** (#86efac) - Impostor syndrome, shrinking oneself, feeling invisible
- **Voice** (#fde68a) - Being told to stay quiet, opinions dismissed, truth suppressed

## Technical Highlights

- **Semantic clustering** (not keyword matching) - understands meaning without shared words
- **Real-time Canvas rendering** - 500+ floating elements at 60fps
- **Zero-config SQLite** - instant setup, scalable to PostgreSQL + pgvector
- **Anonymous by design** - no auth, no tracking, just the truth
- **Responsive breathing UI** - whispers pulse and glow based on cluster density

## Built for International Women's Day 2026

*Anonymous · Real-time · Empowering*
