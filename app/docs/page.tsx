import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';
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
      <p className="docs-subtitle">
        Everything you need to get started.
      </p>

      {docs.length === 0 ? (
        <p>No documentation found. Add MDX files to <code>content/docs/</code>.</p>
      ) : (
        <div className="docs-grid">
          {docs.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className="docs-card">
              <h2>{doc.title}</h2>
              {doc.description && <p>{doc.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
