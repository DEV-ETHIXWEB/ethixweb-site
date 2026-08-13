// Single source of truth for the /hackathon campaign page. Event specifics
// (name, dates, prizes, registration/WhatsApp links) are not finalized yet -
// edit the values below when they are. Nothing here is a secret; the unlock
// code itself lives server-only in HACKATHON_UNLOCK_CODE (see .env.example)
// and is never imported into this file or any client component.

export const hackathonConfig = {
  hackathonName: "Ethixweb Hackathon",
  theme: "Theme to be announced",
  date: "Date to be announced",
  registrationDeadline: "Deadline to be announced",
  prizes: "Prizes to be announced",

  // TODO: replace with the live registration form URL before launch.
  registrationUrl: "https://ethixweb.com/contact",
  // TODO: replace with the real WhatsApp community invite link before launch.
  whatsappUrl: "",

  socialLinks: {
    instagram: { handle: "@ethix.web", url: "https://www.instagram.com/ethix.web/" },
    linkedin: { handle: "Ethixweb", url: "https://www.linkedin.com/company/ethixweb/" },
    facebook: { handle: "Ethixweb", url: "https://www.facebook.com/ethixweb" },
    // Confirmed by decoding the designer-provided QR in
    // a:\HACKATHON FOLDER\Ethixweb-QR-Kit\ethixweb-x-qr-*.png.
    x: { handle: "@ETHIXWEB", url: "https://x.com/ETHIXWEB" },
  },
} as const;

export type HackathonConfig = typeof hackathonConfig;
