import { getAllPosts } from '@/lib/content';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getAllPosts('blog');

  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://sandybridge.io/blog/${post.slug}</link>
      <guid>https://sandybridge.io/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>sandybridge.io</title>
    <link>https://sandybridge.io</link>
    <description>Blog posts from sandybridge.io</description>
    <language>en-us</language>
    <atom:link href="https://sandybridge.io/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
