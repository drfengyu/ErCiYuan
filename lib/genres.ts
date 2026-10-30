const CN: Record<string, string> = {
  Action: '动作',
  Adventure: '冒险',
  Comedy: '搞笑',
  Drama: '剧情',
  Fantasy: '奇幻',
  Horror: '恐怖',
  Iyashikei: '治愈',
  Gore: '血腥',
  'Mahou Shoujo': '魔法少女',
  Music: '音乐',
  Mystery: '悬疑',
  Psychological: '心理',
  Romance: '恋爱',
  'Sci-Fi': '科幻',
  Sports: '运动',
  Supernatural: '超自然',
  Thriller: '惊悚',
};

// 种子与 AniList 导入的类型是英文，筛选条按中文站习惯显示；未知类型回退原文。
export function genreLabel(genre: string) {
  if (genre.startsWith('Slice of Life')) return '日常';
  return CN[genre] || genre;
}
