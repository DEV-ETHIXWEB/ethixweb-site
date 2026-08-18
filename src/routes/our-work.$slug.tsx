import { createFileRoute, notFound } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { IntroCardsSection } from "@/components/case-study/IntroCardsSection";
import { BeforeAfterSlider } from "@/components/case-study/BeforeAfterSlider";
import { ShowcasePanel } from "@/components/case-study/ShowcasePanel";
import { ViewWebsiteButton } from "@/components/case-study/ViewWebsiteButton";
import { SectionDivider } from "@/components/case-study/SectionDivider";
import { DesignApproachSection } from "@/components/case-study/DesignApproachSection";
import { MobileFirstSection } from "@/components/case-study/MobileFirstSection";
import { TechStackSection } from "@/components/case-study/TechStackSection";
import { CaseStudyClosingCta } from "@/components/case-study/CaseStudyClosingCta";
import { CaseStudyContainer } from "@/components/case-study/CaseStudyContainer";
import { getCaseStudyDetail, type CaseStudyDetail } from "@/data/case-studies";

export const Route = createFileRoute("/our-work/$slug")({
  loader: ({ params }) => {
    const study = getCaseStudyDetail(params.slug);
    if (!study) throw notFound();
    return study;
  },
  head: ({ loaderData }) => {
    const study = loaderData as CaseStudyDetail | undefined;
    if (!study) {
      return {
        meta: [
          { title: "Case study not found - Ethixweb" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${study.client.name} - Ethixweb Case Study`;
    return {
      meta: [
        { title },
        { name: "description", content: study.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: study.summary },
        { property: "og:type", content: "article" },
        { property: "og:image", content: `https://www.ethixweb.com${study.heroImage.src}` },
        { property: "og:url", content: `https://www.ethixweb.com/our-work/${study.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: study.summary },
        { name: "twitter:image", content: `https://www.ethixweb.com${study.heroImage.src}` },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: `https://www.ethixweb.com/our-work/${study.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "CaseStudy",
            name: title,
            description: study.summary,
            about: study.client.name,
            image: `https://www.ethixweb.com${study.heroImage.src}`,
            url: `https://www.ethixweb.com/our-work/${study.slug}`,
            author: { "@type": "Organization", name: "Ethixweb", sameAs: "https://www.ethixweb.com" },
          }),
        },
        {
          type: "application/ld+json",
          // Schema only - no visible breadcrumb nav on this page's editorial
          // layout, but search engines still get the trail for rich results.
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Our Work", item: `${SITE_URL}/our-work` },
              { "@type": "ListItem", position: 3, name: study.client.name },
            ],
          }),
        },
      ],
    };
  },
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const study = Route.useLoaderData();

  return (
    <SiteLayout>
      <CaseStudyHero study={study} />

      <IntroCardsSection intro={study.context.intro} cards={study.context.cards} />

      {study.beforeAfter && <SectionDivider />}

      {study.beforeAfter && (
        <BeforeAfterSlider
          beforeImage={study.beforeAfter.beforeImage}
          afterImage={study.beforeAfter.afterImage}
          intro={study.beforeAfter.intro}
          body={study.beforeAfter.body}
        />
      )}

      {study.showcaseImage && <ShowcasePanel image={study.showcaseImage} />}

      {study.websiteUrl && (
        <section className="pb-10 sm:pb-14">
          <CaseStudyContainer className="flex justify-center">
            <ViewWebsiteButton href={study.websiteUrl} />
          </CaseStudyContainer>
        </section>
      )}

      <SectionDivider />

      <IntroCardsSection intro={study.snapshot.intro} cards={study.snapshot.cards} glowLines />

      {study.designApproach && (
        <>
          <SectionDivider />
          <DesignApproachSection
            intro={study.designApproach.intro}
            items={study.designApproach.items}
          />
        </>
      )}

      {study.mobileFirst && (
        <MobileFirstSection intro={study.mobileFirst.intro} image={study.mobileFirst.image} />
      )}

      {study.websiteUrl && (
        <section className="pb-10 sm:pb-14">
          <CaseStudyContainer className="flex justify-center">
            <ViewWebsiteButton href={study.websiteUrl} />
          </CaseStudyContainer>
        </section>
      )}

      <SectionDivider />

      <TechStackSection intro={study.techStack.intro} items={study.techStack.items} />

      <CaseStudyClosingCta study={study} />
    </SiteLayout>
  );
}
