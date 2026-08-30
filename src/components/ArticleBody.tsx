import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';

const components = {
  block: {
    normal: ({ children }: any) => <p className="mb-6 text-lg leading-relaxed text-gray-900">{children}</p>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-800">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-green-600 pl-6 italic text-gray-700 my-8 bg-gray-50 py-4 pr-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
  },
  marks: {
    link: ({ value, children }: any) => (
      <a href={value?.href} className="text-green-700 underline underline-offset-2 hover:text-green-900" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || ''}
            width={800}
            height={500}
            className="rounded-lg w-full"
          />
          {value.caption && <figcaption className="text-sm text-gray-500 mt-2 text-center">{value.caption}</figcaption>}
        </figure>
      );
    },
  },
};

export default function ArticleBody({ content }: { content: any }) {
  return (
    <article className="max-w-3xl mx-auto">
      <PortableText value={content} components={components} />
    </article>
  );
}