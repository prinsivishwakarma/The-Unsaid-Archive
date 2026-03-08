// Demo mode - smart random clustering without OpenAI API
const CLUSTERS = {
  work:   { keywords: ['work', 'job', 'career', 'office', 'meeting', 'boss', 'colleague', 'salary', 'promotion'], weight: 1.0 },
  body:   { keywords: ['body', 'look', 'appearance', 'weight', 'beauty', 'dress', 'clothes', 'hair', 'face'], weight: 1.0 },
  home:   { keywords: ['home', 'family', 'mother', 'father', 'husband', 'wife', 'kids', 'house', 'kitchen'], weight: 1.0 },
  anger:  { keywords: ['angry', 'mad', 'furious', 'rage', 'upset', 'frustrated', 'annoyed', 'irritated'], weight: 1.0 },
  dream:  { keywords: ['dream', 'goal', 'future', 'ambition', 'success', 'achieve', 'become', 'want', 'wish'], weight: 1.0 },
  love:   { keywords: ['love', 'relationship', 'boyfriend', 'girlfriend', 'partner', 'date', 'marry', 'heart'], weight: 1.0 },
  worth:  { keywords: ['worth', 'value', 'enough', 'good', 'capable', 'smart', 'talent', 'confidence', 'believe'], weight: 1.0 },
  voice:  { keywords: ['speak', 'talk', 'voice', 'opinion', 'say', 'tell', 'listen', 'heard', 'silence'], weight: 1.0 }
};

export async function embedAndCluster(text) {
  console.log('🎭 Demo mode: Smart random clustering without OpenAI API');
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Calculate keyword-based scores
  const lowerText = text.toLowerCase();
  const scores = {};
  
  Object.entries(CLUSTERS).forEach(([cluster, config]) => {
    let score = 0;
    config.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += config.weight;
      }
    });
    // Add some randomness for demo purposes
    score += Math.random() * 0.3;
    scores[cluster] = score;
  });
  
  // Find the best cluster
  const sortedClusters = Object.entries(scores).sort(([,a], [,b]) => b - a);
  const bestCluster = sortedClusters[0][0];
  
  // Normalize scores for display
  const maxScore = Math.max(...Object.values(scores));
  const normalizedScores = Object.entries(scores).map(([key, score]) => ({
    key,
    score: (score / maxScore).toFixed(4)
  }));
  
  // Fake embedding (1536 random values for consistency)
  const fakeEmbedding = JSON.stringify(Array.from({ length: 1536 }, () => Math.random()));
  
  return {
    cluster: bestCluster,
    embedding: fakeEmbedding,
    scores: normalizedScores
  };
}
