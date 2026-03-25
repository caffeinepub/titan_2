const IMG_TAG_RE = /\[img\](https?:\/\/[^\]]+)\[\/img\]/;

/**
 * Extracts an embedded image URL from post content.
 * Returns { imageUrl, cleanContent } where cleanContent has the tag stripped.
 */
export function extractPostImage(content: string): {
  imageUrl: string | null;
  cleanContent: string;
} {
  const match = content.match(IMG_TAG_RE);
  if (!match) return { imageUrl: null, cleanContent: content };
  const imageUrl = match[1];
  const cleanContent = content.replace(IMG_TAG_RE, "").trim();
  return { imageUrl, cleanContent };
}

/**
 * Embeds an image URL into post content.
 */
export function embedPostImage(content: string, imageUrl: string): string {
  return `${content}\n[img]${imageUrl}[/img]`;
}
