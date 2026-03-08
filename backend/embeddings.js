import { ObjectId } from 'mongodb';

export const CLUSTERS = {
  work: { keywords: ['work', 'office', 'job', 'boss', 'colleague', 'career', 'meeting', 'deadline', 'salary', 'promotion', 'fired', 'quit', 'harassment'] },
  body: { keywords: ['body', 'health', 'weight', 'sick', 'pain', 'doctor', 'hospital', 'medicine', 'tired', 'headache', 'period', 'pregnant'] },
  home: { keywords: ['home', 'family', 'parents', 'mother', 'father', 'sister', 'brother', 'husband', 'wife', 'kids', 'children', 'house', 'marriage'] },
  anger: { keywords: ['angry', 'mad', 'furious', 'rage', 'yell', 'scream', 'shout', 'frustrated', 'annoyed', 'irritated', 'pissed', 'upset'] },
  dream: { keywords: ['dream', 'future', 'goals', 'aspirations', 'career', 'success', 'ambition', 'achieve', 'believe', 'hope', 'wish', 'desire'] },
  love: { keywords: ['love', 'heart', 'relationship', 'boyfriend', 'girlfriend', 'partner', 'crush', 'dating', 'marriage', 'romance', 'kiss', 'breakup'] },
  worth: { keywords: ['worth', 'value', 'confidence', 'self', 'esteem', 'good enough', 'capable', 'strong', 'beautiful', 'smart', 'talented', 'proud'] }
};

export async function embedAndCluster(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.match(/\b\w+\b/g) || [];

  const clusterScores = {};

  Object.entries(CLUSTERS).forEach(([cluster, config]) => {
    let score = 0;
    config.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    });
    if (score > 0) {
      clusterScores[cluster] = {
        score,
        percentage: (score / config.keywords.length) * 100
      };
    }
  });

  let bestCluster = 'general';
  let maxScore = 0;

  Object.entries(clusterScores).forEach(([cluster, scoreData]) => {
    if (scoreData.score > maxScore) {
      maxScore = scoreData.score;
      bestCluster = cluster;
    }
  });

  const fakeEmbedding = Array(384).fill(0).map(() => Math.random() - 0.5);
  fakeEmbedding[0] = maxScore / 10;

  const normalizedScores = {};
  Object.entries(clusterScores).forEach(([cluster, data]) => {
    normalizedScores[cluster] = data.percentage;
  });

  return {
    cluster: bestCluster,
    embedding: fakeEmbedding,
    scores: normalizedScores
  };
}
