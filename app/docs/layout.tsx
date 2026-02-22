import { getAllDocs } from '@/lib/docs';
import { DocsSidebar } from '@/components/docs-sidebar';
import s from './docs.module.css';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = await getAllDocs();

  return (
    <div className={s.layout} data-docs-layout>
      <DocsSidebar
        docs={docs.map((d) => ({
          slug: d.slug,
          title: d.title,
          headings: d.headings,
        }))}
      />
      <div className={s.content}>
        {children}
      </div>
    </div>
  );
}
