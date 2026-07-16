// Single source of truth for open roles. Used by the careers landing page,
// individual job detail pages, the application form's role picker, the
// sitemap, and JobPosting structured data - update a role here and every
// surface stays in sync.

export type JobId = "full-stack-developer" | "seo-specialist";

export interface Job {
  id: JobId;
  slug: string;
  title: string;
  department: string;
  type: string;
  experience: string;
  location: string;
  salary: string;
  /** ISO date this role was first posted - used for JobPosting structured data. */
  datePosted: string;
  summary: string;
  about: string;
  responsibilities: string[];
  skills: string[];
  bonus: string[];
  otherRequirements: string[];
  benefits: string[];
  faqs: { q: string; a: string }[];
}

export const JOBS: Job[] = [
  {
    id: "full-stack-developer",
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    department: "Engineering",
    type: "Full Time",
    experience: "0-3 Years",
    location: "Remote (India)",
    salary: "Not disclosed",
    datePosted: "2026-07-01",
    summary:
      "Build and ship scalable web applications end to end for our US clients: React on the frontend, Node.js on the backend.",
    about:
      "We're looking for a Full Stack Developer to join our small, senior engineering team and own features end to end, from database schema to deployed UI. You'll work directly with US clients, ship production code every week, and have real input into architecture decisions.",
    responsibilities: [
      "Build scalable web applications used by real US clients",
      "Develop frontend interfaces in React",
      "Develop backend services using Node.js",
      "Design and ship REST APIs",
      "Implement authentication and authorization",
      "Design and maintain databases",
      "Profile and optimize application performance",
      "Diagnose and fix production bugs",
      "Own production deployments",
    ],
    skills: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "TypeScript",
      "JavaScript",
      "Git",
      "REST APIs",
      "Responsive UI",
    ],
    bonus: ["Docker", "AWS", "Redis", "Experience working with US clients"],
    otherRequirements: [
      "Comfortable with remote, async friendly collaboration",
      "Clear written and verbal English communication",
      "Familiarity with Slack, ClickUp, Loom and Google Workspace",
    ],
    benefits: [
      "Remote first: work from anywhere in India",
      "Flexible working hours",
      "Direct ownership over real client projects",
      "Modern engineering stack, no legacy spaghetti",
      "Fast career growth in a small, high impact team",
      "Learning budget and a culture that rewards curiosity",
    ],
    faqs: [
      {
        q: "Will I be working directly with clients?",
        a: "Yes. We're a small team, so engineers regularly join client calls, scope features, and own the projects they build, not just tickets handed down from a PM.",
      },
      {
        q: "What does the tech stack actually look like day to day?",
        a: "Mostly React + TypeScript on the frontend, Node.js/Express APIs on the backend, and MongoDB or PostgreSQL depending on the project. Some projects use Docker and AWS for deployment.",
      },
      {
        q: "Is this role remote?",
        a: "Yes, fully remote within India. We're a remote first team and collaborate asynchronously over Slack, ClickUp and Loom, with overlap hours for US client calls.",
      },
      {
        q: "What's the interview process like?",
        a: "Application review, a short intro interview, a practical technical round (real world problems, not whiteboard trivia), then an offer. Most candidates go from application to offer within two weeks.",
      },
    ],
  },
  {
    id: "seo-specialist",
    slug: "seo-specialist",
    title: "Search Engine Optimization (SEO) Specialist",
    department: "Marketing",
    type: "Full Time",
    experience: "0-1 Years",
    location: "Remote (India)",
    salary: "Not disclosed",
    datePosted: "2026-07-01",
    summary:
      "Help our US home service clients win local search through technical SEO, on page optimization, and Core Web Vitals improvements.",
    about:
      "We're looking for an SEO Specialist to manage organic growth for our US home service clients: plumbers, HVAC and electrical contractors who depend on local search to fill their calendars. You'll own everything from technical audits to monthly reporting across multiple client accounts.",
    responsibilities: [
      "Perform complete on page SEO: meta titles, meta descriptions, heading structure, internal linking",
      "Implement schema markup across client sites",
      "Run technical SEO audits and identify broken links",
      "Fix 404 errors and resolve duplicate content issues",
      "Monitor indexation and search console coverage",
      "Improve Core Web Vitals and overall page speed",
      "Perform WordPress development and Elementor editing",
      "Set up and maintain GA4 and Google Search Console",
      "Optimize Google Business Profiles and build citations",
      "Own local SEO strategy across client accounts",
      "Deliver monthly SEO reporting to clients",
    ],
    skills: [
      "Google Analytics",
      "Google Search Console",
      "Google Ads",
      "Technical SEO",
      "On Page SEO",
      "Local SEO",
      "WordPress",
      "Elementor",
      "Schema Markup",
      "Core Web Vitals",
      "Keyword Research",
    ],
    bonus: [
      "Experience with home service / contractor clients",
      "Comfortable presenting reports directly to clients",
      "Basic HTML/CSS for on page fixes",
    ],
    otherRequirements: [
      "Excellent written and verbal English communication",
      "Comfortable with remote collaboration via Slack, ClickUp, Loom and Google Workspace",
      "Strong attention to detail",
      "Ability to manage multiple client accounts at once",
    ],
    benefits: [
      "Remote first: work from anywhere in India",
      "Flexible working hours",
      "Ownership over real client accounts, not just task lists",
      "Direct exposure to US clients and their businesses",
      "Fast career growth in a small, high impact team",
      "Learning culture and a flexible working environment",
    ],
    faqs: [
      {
        q: "How many client accounts would I be managing?",
        a: "Typically 4-8 home service client accounts at a time, depending on scope. You'll own the SEO roadmap and monthly reporting for each.",
      },
      {
        q: "Do I need agency experience?",
        a: "Minimum one year of hands on SEO experience is required. Agency or in house both work, as long as you've run real campaigns and can show results.",
      },
      {
        q: "Will I be doing any web development?",
        a: "Light WordPress/Elementor work is part of the role: on page fixes, schema implementation, and performance tweaks. You won't need to build sites from scratch.",
      },
      {
        q: "Is this role remote?",
        a: "Yes, fully remote within India, with some overlap hours for US client communication and reporting calls.",
      },
    ],
  },
];

export function getJob(id: string | null | undefined): Job | undefined {
  return JOBS.find((j) => j.id === id);
}

export const HIRING_PROCESS = [
  { title: "Application", description: "You submit your details, resume and a short cover note." },
  {
    title: "Resume Review",
    description: "Our team reviews your background against the role within 2-3 business days.",
  },
  {
    title: "Interview",
    description: "A 30-45 minute conversation about your experience, expectations and the role.",
  },
  {
    title: "Technical Round",
    description: "A practical, real world technical exercise relevant to the position.",
  },
  {
    title: "Offer",
    description: "We extend an offer with clear compensation and start date details.",
  },
  {
    title: "Welcome to Ethixweb",
    description: "Onboarding, tooling access and your first project kickoff.",
  },
];
