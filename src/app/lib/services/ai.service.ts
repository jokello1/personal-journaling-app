function analyzeSentiment(text: string): {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    suggestedMood: string;
  } {
    // Simple word-based sentiment analysis
    const positiveWords = [
      'happy', 'joy', 'excited', 'wonderful', 'great', 'good', 'excellent',
      'amazing', 'love', 'enjoy', 'pleased', 'delighted', 'grateful', 'thankful'
    ];
    
    const negativeWords = [
      'sad', 'angry', 'upset', 'terrible', 'bad', 'awful', 'horrible',
      'hate', 'dislike', 'disappointed', 'worry', 'anxious', 'stressed',
      'tired', 'exhausted', 'frustrated'
    ];
    
    // Normalize text: lowercase and remove HTML
    const normalizedText = text.toLowerCase().replace(/<[^>]+>/g, ' ');
    const words = normalizedText.split(/\W+/).filter(Boolean);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount
if (negativeWords.includes(word)) negativeCount++;
});

const totalSentiment = positiveCount - negativeCount;
let sentiment: 'positive' | 'negative' | 'neutral';
let suggestedMood: string;

if (totalSentiment > 0) {
  sentiment = 'positive';
  const positiveMoods = ['Happy', 'Excited', 'Productive', 'Calm'];
  suggestedMood = positiveMoods[Math.floor(Math.random() * positiveMoods.length)];
} else if (totalSentiment < 0) {
  sentiment = 'negative';
  const negativeMoods = ['Sad', 'Angry', 'Stressed', 'Anxious', 'Tired'];
  suggestedMood = negativeMoods[Math.floor(Math.random() * negativeMoods.length)];
} else {
  sentiment = 'neutral';
  suggestedMood = 'Neutral';
}

// Normalize score between -1 and 1
const totalWords = words.length;
const score = totalWords > 0 ? totalSentiment / Math.min(totalWords, 100) : 0;

return {
  sentiment,
  score: parseFloat(score.toFixed(2)),
  suggestedMood
};
}

// Extract potential tags from entry content
function extractTags(text: string, existingTags: string[]): string[] {
// Remove HTML tags and normalize text
const normalizedText = text.toLowerCase().replace(/<[^>]+>/g, ' ');

// Common stop words to filter out
const stopWords = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'that', 'this',
  'it', 'i', 'my', 'me', 'mine', 'you', 'your', 'yours', 'he', 'she', 'they'
]);

// Extract words and count their frequency
const words = normalizedText.split(/\W+/).filter(word => 
  word.length > 3 && !stopWords.has(word)
);

const wordFrequency = new Map<string, number>();
words.forEach(word => {
  wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
});

// Find the most frequent words (potential tags)
const potentialTags = Array.from(wordFrequency.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([word]) => word);

// Filter out tags that already exist
const existingTagsLower = existingTags.map(tag => tag.toLowerCase());
return potentialTags.filter(tag => !existingTagsLower.includes(tag));
}

export async function analyzeEntryContent(content: string, existingTags: string[] = []) {
// Analyze the sentiment
const sentimentAnalysis = analyzeSentiment(content);

// Extract potential tags
const suggestedTags = extractTags(content, existingTags).slice(0, 5);

return {
  sentiment: sentimentAnalysis.sentiment,
  sentimentScore: sentimentAnalysis.score,
  suggestedMood: sentimentAnalysis.suggestedMood,
  suggestedTags
};
}