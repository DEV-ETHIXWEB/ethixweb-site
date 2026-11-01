import type { Post } from "./types";

const post: Post = {
  slug: "call-tracking-for-contractors",
  title: "Call tracking for contractors: know which marketing books jobs",
  metaTitle: "Call Tracking for HVAC & Plumbing Companies: A Simple Guide",
  metaDescription:
    "How call tracking works for HVAC and plumbing companies, what to track, and how to tie calls to booked jobs so you know which marketing actually pays.",
  category: "Growth",
  readMinutes: 6,
  published: "2026-11-01",
  excerpt:
    "Most home service leads arrive as phone calls, so most contractors can't say which ad or page produced them. Call tracking fixes that. Here's how it works and how to set it up properly.",
  body: [
    {
      p: "For an HVAC or plumbing company, the phone is still where most jobs start. That is good for business and bad for measurement. A form fill tells you exactly where it came from. A phone call just rings. Without call tracking, you are guessing which ads, pages and listings are worth paying for.",
    },
    { h2: "How call tracking works" },
    {
      p: "Call tracking gives each marketing source its own phone number. Calls to those numbers forward to your normal line, so nothing changes for your team, but every call is recorded against the source it came from.",
    },
    {
      ul: [
        "**Source numbers**: one number for your Google Business Profile, one for print or truck wraps, one for a direct mail piece.",
        "**Dynamic numbers on your website**: the number shown on the site changes based on how the visitor arrived, such as a Google ad, organic search or a Facebook post, so each website call is tied to the exact source and even the search keyword.",
        "**Call details**: time, length, caller location, whether it was answered, and optionally a recording to check the quality of leads and how calls are handled.",
      ],
    },
    {
      note: "Using a tracking number on your Google Business Profile is fine if you list it as the primary number and keep your main number as an additional number, so your listing details stay consistent across the web.",
    },
    { h2: "What to measure" },
    {
      p: "A tracking dashboard can show dozens of numbers. These are the ones that matter for a home service company:",
    },
    {
      ol: [
        "**Calls by source**: how many calls each channel produces each month.",
        "**Answer rate**: how many of those calls a person or receptionist actually picked up. Missed calls are often the biggest leak in the whole business.",
        "**Qualified calls**: real job inquiries, not spam, vendors or existing customers checking on a visit.",
        "**Booked jobs by source**: how many calls turned into appointments.",
        "**Cost per booked job**: spend on each channel divided by the jobs it booked. This is the number to make budget decisions with.",
      ],
    },
    { h2: "Connect it to your field software" },
    {
      p: "Call tracking on its own tells you how many calls came in. To know which ones turned into revenue, connect it to the software you run jobs in, such as ServiceTitan, Jobber or Housecall Pro. Then each booked job, and eventually each invoice, can be traced back to the marketing that produced it.",
    },
    {
      p: "This is also how you make Google Ads smarter. When booked jobs are sent back to Google Ads as conversions, the campaigns learn to find more people who book, not just more people who click.",
    },
    { h2: "What it usually reveals" },
    {
      ul: [
        "One or two channels produce most booked jobs, and some produce almost none.",
        "A meaningful share of calls go unanswered at busy times and after hours.",
        "Certain pages on the website produce far more calls than others, which shows where to invest next.",
        "Some leads that look cheap rarely book, and some that look expensive book very well.",
      ],
    },
    {
      p: "If the answer rate is the problem, an [AI receptionist](/ai-automation) can catch the calls your team misses. If a channel is not booking work, move that budget to one that is. Our guide to [setting a marketing budget](/blog/hvac-plumbing-marketing-budget) walks through how.",
    },
    { h2: "Getting started" },
    {
      ol: [
        "Choose a call tracking tool that supports dynamic website numbers and connects to your field software.",
        "Set up numbers for each major source, and dynamic numbers on the website.",
        "Mark which calls book jobs, automatically if your software allows it.",
        "Review calls, answer rate and cost per booked job every month.",
      ],
    },
    {
      p: "We set up call tracking for every client before we spend a dollar on ads, so the reporting shows booked jobs from day one. See how it fits into our [Google Ads and Local Services Ads management](/google-ads-management).",
    },
  ],
  related: [
    { label: "Google Ads & LSA management", to: "/google-ads-management" },
    { label: "AI receptionist", to: "/ai-automation" },
    { label: "Setting a marketing budget", to: "/blog/hvac-plumbing-marketing-budget" },
  ],
};

export default post;
