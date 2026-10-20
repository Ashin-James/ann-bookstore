import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { books } from '@/data/books';
import Container from '@/components/container';
import Section from '@/components/section';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);

  if (!book) {
    return (
      <Section className="reading-page-section">
        <Container className="reading-page" style={{ maxWidth: '720px' }}>
          <Link className="text-link" href="/books">
            <ArrowLeft size={16} aria-hidden="true" /> Back to books
          </Link>
          <h1>Sample not found</h1>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="reading-page-section">
      <Container className="reading-page" style={{ maxWidth: '720px' }}>
        <Link className="text-link" href={`/books/${slug}`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to the book
        </Link>
        <span className="eyebrow">A SAMPLE · CHAPTER ONE</span>
        <h1>{book.title}</h1>
        <p className="chapter-dropcap">
          The rain had been falling since morning, soft at first, then with the certainty of something remembered. By evening, the windows had turned into mirrors, and the house seemed to hold its breath.
        </p>
        <p>
          On the table, a cup of tea cooled beside a letter that had travelled farther than anyone expected. Nobody had opened it. Not yet.
        </p>
        <p>
          Some things ask for time. Others simply wait until we are ready to see them.
        </p>
        <div className="chapter-end">— End of sample —</div>
        <Link className="button button-dark" href={`/books/${slug}`}>
          Explore the book
        </Link>
        <p className="placeholder-note" style={{ marginTop: '24px' }}>
          Original sample text written for this demo. Replace with an excerpt approved by Ann.
        </p>
      </Container>
    </Section>
  );
}
