import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock, Lightbulb, PenLine } from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import {
  LOGO_IMAGE,
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_URL,
  siteUrl,
} from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/shared/Container";
import { CTASection } from "@/components/shared/CTASection";
import { FaqList, faqSchema } from "@/components/shared/FaqList";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { PageTag } from "@/components/shared/PageTag";
import { Reveal } from "@/components/shared/Reveal";
import { RichText, plainText } from "@/components/blog/RichText";
import { POSTS, getPost, type Post, type PostBlock, type PostImage } from "@/data/posts";

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
    // A post with its own social card uses it; everything else falls back to
    // the site-wide one. Both are 1200x630, so the dimensions stay fixed.
    const socialImage = post.socialImage ? siteUrl(post.socialImage) : OG_IMAGE;
    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:image", content: socialImage },
        { property: "og:image:width", content: OG_IMAGE_WIDTH },
        { property: "og:image:height", content: OG_IMAGE_HEIGHT },
        { property: "og:image:alt", content: post.heroImage?.alt ?? post.title },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.published },
        { property: "article:modified_time", content: post.updated ?? post.published },
        { property: "article:section", content: post.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.metaDescription },
        { name: "twitter:image", content: socialImage },
        { name: "twitter:image:alt", content: post.heroImage?.alt ?? post.title },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [
        { rel: "canonical", href: url },
        // The lead image is the LCP element on an article that has one, and
        // it is a plain <img> in the body, so the browser only finds it after
        // parsing. This gets the fetch started with the HTML.
        ...(post.heroImage
          ? [
              {
                rel: "preload",
                as: "image",
                href: post.heroImage.src,
                imageSrcSet: post.heroImage.srcSet,
                imageSizes: HERO_IMAGE_SIZES,
              },
            ]
          : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription,
            image: post.heroImage
              ? {
                  "@type": "ImageObject",
                  url: siteUrl(post.heroImage.src),
                  width: post.heroImage.width,
                  height: post.heroImage.height,
                }
              : OG_IMAGE,
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
        // Only when the questions are also rendered on the page, below.
        ...(post.faqs?.length ? [faqSchema(post.faqs)] : []),
      ],
    };
  },
  component: Article,
});

/** The lead image fills the 7xl container; body figures fill the 44rem text
 * column. Both drop to the full viewport width on a phone. */
const HERO_IMAGE_SIZES =
  "(min-width: 1280px) 1216px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)";
const FIGURE_SIZES =
  "(min-width: 1280px) 868px, (min-width: 1024px) calc(100vw - 23rem), (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)";

function blockText(b: PostBlock): string {
  if ("p" in b) return b.p;
  if ("h2" in b) return b.h2;
  if ("h3" in b) return b.h3;
  if ("note" in b) return b.note;
  if ("figure" in b) return b.figure.caption ?? "";
  if ("ul" in b) return b.ul.join(" ");
  return b.ol.join(" ");
}

function wordCount(post: Post) {
  return post.body.map((b) => plainText(blockText(b))).join(" ").split(/\s+/).length;
}

/** Comfortable measure for running text, roughly 75 characters. It sits on
 * each text block rather than on the article column, so a diagram can use
 * the full width of the column while the prose beside it stays readable. */
const PROSE = "max-w-[44rem]";

function Block({ block }: { block: PostBlock }) {
  if ("h2" in block)
    return (
      <h2 className={`mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl ${PROSE}`}>
        {block.h2}
      </h2>
    );
  if ("h3" in block)
    return (
      <h3 className={`mt-8 font-display text-xl font-semibold text-foreground ${PROSE}`}>
        {block.h3}
      </h3>
    );
  if ("p" in block)
    return (
      <p className={`mt-5 ${PROSE}`}>
        <RichText text={block.p} />
      </p>
    );
  if ("note" in block)
    return (
      <aside
        className={`mt-8 flex gap-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5 sm:p-6 ${PROSE}`}
      >
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-foreground/90">
          <RichText text={block.note} />
        </p>
      </aside>
    );
  if ("figure" in block) return <Figure image={block.figure} />;
  const items = "ul" in block ? block.ul : block.ol;
  const ListTag = "ul" in block ? "ul" : "ol";
  return (
    <ListTag
      className={`mt-5 space-y-3 pl-6 marker:text-primary ${PROSE} ${"ul" in block ? "list-disc" : "list-decimal marker:font-semibold"}`}
    >
      {items.map((item) => (
        <li key={item.slice(0, 40)} className="pl-1">
          <RichText text={item} />
        </li>
      ))}
    </ListTag>
  );
}

/** A diagram in the article body. The frame is sized from the image's own
 * aspect ratio, so the space is reserved before the file lands and the text
 * below never jumps. The reveal is the site's shared one: it plays once as
 * the figure approaches, and never on a phone. */
function Figure({ image }: { image: PostImage & { caption?: string } }) {
  return (
    <Reveal className="mt-10">
      <figure>
        <div
          className="overflow-hidden rounded-2xl border border-border bg-[#120405] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/[0.06] sm:rounded-3xl"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={FIGURE_SIZES}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
          />
        </div>
        {image.caption && (
          <figcaption className="mt-3.5 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground/80">
            <span aria-hidden="true" className="mt-2.5 h-px w-6 shrink-0 bg-primary/60" />
            <span>{image.caption}</span>
          </figcaption>
        )}
      </figure>
    </Reveal>
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

      {post.heroImage && (
        <section className="pt-6 sm:pt-8">
          <Container>
            {/* No Reveal: this is the LCP element and it is on screen at
                load, so it must paint with the HTML rather than wait. */}
            <div
              className="overflow-hidden rounded-3xl border border-border bg-[#120405] shadow-[0_28px_80px_-32px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/[0.06] sm:rounded-4xl"
              style={{ aspectRatio: `${post.heroImage.width} / ${post.heroImage.height}` }}
            >
              <img
                src={post.heroImage.src}
                srcSet={post.heroImage.srcSet}
                sizes={HERO_IMAGE_SIZES}
                width={post.heroImage.width}
                height={post.heroImage.height}
                alt={post.heroImage.alt}
                fetchPriority="high"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </div>
          </Container>
        </section>
      )}

      <article className="py-10 sm:py-14">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="text-[1.0625rem] leading-[1.8] text-muted-foreground">
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

      {post.faqs && post.faqs.length > 0 && (
        <section className="border-t border-border/60 py-14 sm:py-16">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-text">
                    Questions
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                    Still deciding?
                  </h2>
                </div>
                <p className="max-w-md text-muted-foreground">
                  The questions owners ask us most when they are picking field service software, or
                  trying to make the one they already have work with their website.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <FaqList faqs={post.faqs} className="mt-10" />
            </Reveal>
          </Container>
        </section>
      )}

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
