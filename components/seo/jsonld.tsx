export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function organizationSchema(input: {
  name: string;
  url: string;
  description: string;
  email: string;
  logo?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    description: input.description,
    email: input.email,
    ...(input.logo ? { logo: `${input.url}${input.logo}` } : {}),
  };
}

export function websiteSchema(input: { name: string; url: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
    description: input.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${input.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function productSchema(input: {
  name: string;
  description: string;
  image: string;
  url: string;
  brand: string;
  price: number;
  currency: string;
  sku: string;
  origin?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.image,
    url: input.url,
    sku: input.sku,
    brand: { '@type': 'Brand', name: input.brand },
    ...(input.origin ? { countryOfOrigin: input.origin } : {}),
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: input.currency,
      availability: 'https://schema.org/InStock',
      url: input.url,
    },
  };
}
