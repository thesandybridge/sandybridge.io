import { getAllDocs } from '@/lib/docs';
import { DocsSidebar } from '@/components/docs-sidebar';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = await getAllDocs();

  return (
    <div className="docs-layout">
      <DocsSidebar
        docs={docs.map((d) => ({
          slug: d.slug,
          title: d.title,
          headings: d.headings,
        }))}
      />
      <div className="docs-content">
        {children}
      </div>
    </div>
  );
}
