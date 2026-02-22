import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';
import s from './docs.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Project documentation',
};

export default async function DocsPage() {
  const docs = await getAllDocs();

  return (
    <>
      <h1>Documentation</h1>
      <p className={s.subtitle}>
        Everything you need to get started.
      </p>

      {docs.length === 0 ? (
        <p>No documentation found. Add MDX files to <code>content/docs/</code>.</p>
      ) : (
        <div className={s.grid}>
          {docs.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className={s.card}>
              <h2>{doc.title}</h2>
              {doc.description && <p>{doc.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
