import type { WordPair } from '../types';

export function parseWordPairs(response: string): WordPair[] {
  try {
    // Try to find a JSON array in the response
    const jsonMatch = response.match(/\[\s*{[^]*}\s*\]/);
    if (!jsonMatch) return [];

    const jsonStr = jsonMatch[0].trim();
    const pairs: WordPair[] = JSON.parse(jsonStr);

    // Validate the structure of each pair
    return pairs.filter(pair => 
      pair &&
      typeof pair === 'object' &&
      typeof pair.source === 'string' &&
      typeof pair.target === 'string' &&
      pair.source.trim() !== '' &&
      pair.target.trim() !== ''
    );
  } catch (error) {
    console.error('Error parsing word pairs:', error);
    return [];
  }
}