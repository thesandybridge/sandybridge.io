import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getMDXComponents } from '@/lib/mdx-components';

export const metadata: Metadata = {
  title: 'Now',
  description: "What I'm currently focused on.",
};

async function getNowContent() {
  const filePath = path.join(process.cwd(), 'content/pages/now.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);
  return content;
}

export default async function NowPage() {
  const content = await getNowContent();

  return (
    <>
      <h1>Now</h1>
      <p>What I&apos;m currently focused on and working towards.</p>
      <MDXRemote
        source={content}
        components={getMDXComponents()}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </>
  );
}
