import { ImageResponse } from 'next/og';
import { getPost, getAllPosts } from '@/lib/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return getAllPosts('blog').map((post) => ({ slug: post.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost('blog', slug);
  const title = post?.title || slug;
  const date = post?.date || '';
  const tags = post?.tags || [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: '#151515',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 28, color: '#928374' }}>sandybridge.io</div>
          <div style={{ fontSize: 56, color: '#d79921', lineHeight: 1.2, maxWidth: '90%' }}>{title}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {tags.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 20,
                  color: '#928374',
                  border: '1px solid #303030',
                  borderRadius: 4,
                  padding: '4px 12px',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          {date && <div style={{ fontSize: 22, color: '#928374' }}>{date}</div>}
        </div>
      </div>
    ),
    { ...size }
  );
}
