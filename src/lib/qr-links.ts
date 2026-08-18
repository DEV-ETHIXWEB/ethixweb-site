// Central place a printed business-card QR points at its current
// destination. The QR image itself only ever encodes /qr/<slug> (see
// src/routes/qr.$slug.ts, which does the actual redirect) - so changing
// where someone's card points to is just editing the value below and
// redeploying, never reprinting a new QR code.
export const QR_LINKS: Record<string, string> = {
  amar: "https://www.ethixweb.com",
  hackathon: "https://www.ethixweb.com/hackathon",
};
