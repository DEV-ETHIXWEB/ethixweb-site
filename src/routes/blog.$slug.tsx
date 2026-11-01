import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock, Lightbulb, PenLine } from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { LOGO_IMAGE, OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/shared/Container";
import { CTASection } from "@/components/shared/CTASection";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { PageTag } from "@/components/shared/PageTag";
import { RichText, plainText } from "@/components/blog/RichText";
import { POSTS, getPost, type Post, type PostBlock } from "@/data/posts";

function formatDate(iso: string) {
  // Fixed time zone so the server and the browser print the same date.
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const post = loaderData as Post | undefined;
    if (!post) {
      return {
        meta: [{ title: "Article not found - Ethixweb" }, { name: "robots", content: "noindex" }],
      };
    }
    const url = siteUrl(`/blog/${post.slug}`);
    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:image", content: OG_IMAGE },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.published },
        { property: "article:modified_time", content: post.updated ?? post.published },
        { property: "article:section", content: post.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.metaDescription },
        { name: "twitter:image", content: OG_IMAGE },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription,
            image: OG_IMAGE,
            url,
            mainEntityOfPage: url,
            datePublished: post.published,
            dateModified: post.updated ?? post.published,
            articleSection: post.category,
            wordCount: wordCount(post),
            author: { "@type": "Organization", name: "Ethixweb", url: SITE_URL },
            publisher: {
              "@type": "Organization",
              name: "Ethixweb",
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: LOGO_IMAGE },
            },
          }),
        },
      ],
    };
  },
  component: Article,
});

function blockText(b: PostBlock): string {
  if ("p" in b) return b.p;
  if ("h2" in b) return b.h2;
  if ("h3" in b) return b.h3;
  if ("note" in b) return b.note;
  if ("ul" in b) return b.ul.join(" ");
  return b.ol.join(" ");
}

function wordCount(post: Post) {
  return post.body.map((b) => plainText(blockText(b))).join(" ").split(/\s+/).length;
}

function Block({ block }: { block: PostBlock }) {
  if ("h2" in block)
    return (
      <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
        {block.h2}
      </h2>
    );
  if ("h3" in block)
    return <h3 className="mt-8 font-display text-xl font-semibold text-foreground">{block.h3}</h3>;
  if ("p" in block)
    return (
      <p className="mt-5">
        <RichText text={block.p} />
      </p>
    );
  if ("note" in block)
    return (
      <aside className="mt-8 flex gap-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5 sm:p-6">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-foreground/90">
          <RichText text={block.note} />
        </p>
      </aside>
    );
  const items = "ul" in block ? block.ul : block.ol;
  const ListTag = "ul" in block ? "ul" : "ol";
  return (
    <ListTag
      className={`mt-5 space-y-3 pl-6 marker:text-primary ${"ul" in block ? "list-disc" : "list-decimal marker:font-semibold"}`}
    >
      {items.map((item) => (
        <li key={item.slice(0, 40)} className="pl-1">
          <RichText text={item} />
        </li>
      ))}
    </ListTag>
  );
}

function Article() {
  const post = Route.useLoaderData();
  const others = POSTS.filter((p) => p.slug !== post.slug);

  return (
    <SiteLayout>
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-14 pt-36 sm:pb-16 sm:pt-40">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <GlowBlob size="md" color="primary" className="left-1/2 top-0 -translate-x-1/2 opacity-60" />
        <Container className="relative">
          <div className="max-w-3xl">
            <PageTag items={[post.category, `${post.readMinutes} min read`]} icon={PenLine} />
            <h1 className="mt-7 text-balance pb-1 text-[clamp(2.2rem,4.6vw,3.75rem)] font-extrabold leading-[1.08] text-gradient">
              {post.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>By the Ethixweb team</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published}>{formatDate(post.published)}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
              </span>
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumbs items={[{ label: "Blog", to: "/blog" }, { label: post.title }]} />
      </Container>

      <article className="py-10 sm:py-14">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="max-w-[44rem] text-[1.0625rem] leading-[1.8] text-muted-foreground">
            {post.body.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass-strong rounded-3xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-text">
                Keep reading
              </p>
              <ul className="mt-4 space-y-3">
                {post.related.map((r) => (
                  <li key={r.to}>
                    <Link
                      to={r.to}
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {r.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="btn-primary group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                Book a free call
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </Container>
      </article>

      {others.length > 0 && (
        <section className="py-12">
          <Container>
            <h2 className="font-display text-2xl font-bold">More from the blog</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="glass group flex flex-col rounded-3xl p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-text">
                    {p.category}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug group-hover:text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTASection
        title="Want this done for your business?"
        description="Book a free call. We'll review your website, Google profile and ads, and show you where the jobs are leaking."
        ctaLabel="Book a free call"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}
