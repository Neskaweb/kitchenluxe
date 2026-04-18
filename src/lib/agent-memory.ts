export interface StyleMetrics {
  clicks: number;
  posts: number;
}

export interface AgentMemory {
  version: number;
  lastUpdated: string;
  winningStyle: 'GUIDE' | 'DUEL' | 'RECETTE' | null;
  topCategory: string | null;
  styles: Record<string, StyleMetrics>;
  categories: Record<string, StyleMetrics>;
  totalRuns: number;
  history: Array<{ date: string; style: string; title: string; clicks: number }>;
}

export const DEFAULT_MEMORY: AgentMemory = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  winningStyle: null,
  topCategory: null,
  styles: {
    GUIDE: { clicks: 0, posts: 0 },
    DUEL: { clicks: 0, posts: 0 },
    RECETTE: { clicks: 0, posts: 0 },
  },
  categories: {},
  totalRuns: 0,
  history: [],
};

// Epsilon-greedy: 70% exploitation (winning style), 30% exploration (random)
export function pickStyle(memory: AgentMemory): 'GUIDE' | 'DUEL' | 'RECETTE' {
  const styles = ['GUIDE', 'DUEL', 'RECETTE'] as const;
  if (memory.winningStyle && Math.random() < 0.70) {
    return memory.winningStyle;
  }
  return styles[Math.floor(Math.random() * styles.length)];
}

export function updateMemory(
  memory: AgentMemory,
  posts: Array<{ style?: string; category?: string; relatedProductId?: string }>,
  clicksByProduct: Record<string, number>
): AgentMemory {
  const updated: AgentMemory = JSON.parse(JSON.stringify(memory));

  // Reset counts
  updated.styles = {
    GUIDE: { clicks: 0, posts: 0 },
    DUEL: { clicks: 0, posts: 0 },
    RECETTE: { clicks: 0, posts: 0 },
  };
  updated.categories = {};

  posts.forEach(post => {
    const style = post.style || 'GUIDE';
    if (!updated.styles[style]) updated.styles[style] = { clicks: 0, posts: 0 };
    updated.styles[style].posts++;

    if (post.category) {
      if (!updated.categories[post.category]) updated.categories[post.category] = { clicks: 0, posts: 0 };
      updated.categories[post.category].posts++;
    }

    const productClicks = post.relatedProductId ? (clicksByProduct[post.relatedProductId] || 0) : 0;
    if (productClicks > 0) {
      if (post.style && updated.styles[post.style]) {
        updated.styles[post.style].clicks += productClicks;
      }
      if (post.category && updated.categories[post.category]) {
        updated.categories[post.category].clicks += productClicks;
      }
    }
  });

  // Best style = highest clicks/posts ratio (min 3 posts required)
  let bestStyle: AgentMemory['winningStyle'] = null;
  let bestScore = 0;
  Object.entries(updated.styles).forEach(([style, m]) => {
    if (m.posts >= 3) {
      const score = m.clicks / m.posts;
      if (score > bestScore) { bestScore = score; bestStyle = style as AgentMemory['winningStyle']; }
    }
  });
  updated.winningStyle = bestStyle;

  // Best category
  let bestCat: string | null = null;
  let bestCatScore = 0;
  Object.entries(updated.categories).forEach(([cat, m]) => {
    if (m.posts >= 2) {
      const score = m.clicks / m.posts;
      if (score > bestCatScore) { bestCatScore = score; bestCat = cat; }
    }
  });
  updated.topCategory = bestCat;
  updated.lastUpdated = new Date().toISOString();

  return updated;
}
