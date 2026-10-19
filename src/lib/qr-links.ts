// Central place a printed business-card QR points at its current
// destination. The QR image itself only ever encodes /qr/<slug> (see
// src/routes/qr.$slug.ts, which does the actual redirect) - so changing
// where someone's card points to is just editing the value below and
// redeploying, never reprinting a new QR code.
//
// Deliberately absolute production URLs rather than the SITE_URL helper the
// rest of the site uses: a card already in someone's wallet has to land on
// the live site no matter which deployment happens to serve the redirect, so
// these must not follow a preview deploy's VITE_SITE_URL.
export const QR_LINKS: Record<string, string> = {
  amar: "https://www.ethixweb.com",
  hackathon: "https://www.ethixweb.com/hackathon",
};
