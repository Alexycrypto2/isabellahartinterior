export type PostHealth = { words: number; images: number; level: 'ready' | 'good' | 'thin' };

export function getPostHealth(content: string, hasCover: boolean): PostHealth {
  const html = content || '';
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const images = (html.match(/<img\b/gi) || []).length + (hasCover ? 1 : 0);
  const level = words >= 1800 && images >= 4 ? 'ready' : words >= 1200 ? 'good' : 'thin';
  return { words, images, level };
}
