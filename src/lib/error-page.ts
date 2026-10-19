export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* This page is served standalone, outside the app, so it has no access
         to the theme the visitor chose. It was hard-coded light, which meant
         anyone on the dark site hit a full white flash at the worst possible
         moment. Following the OS preference is the closest it can get, and
         the site's own default is dark. */
      :root { color-scheme: light dark; --bg: #fafafa; --fg: #111; --muted: #4b5563; --line: #d1d5db; --btn-bg: #111; --btn-fg: #fff; --card: #fff; }
      @media (prefers-color-scheme: dark) {
        :root { --bg: #0c0d10; --fg: #f4f4f5; --muted: #a1a1aa; --line: #2a2d34; --btn-bg: #c0272d; --btn-fg: #fff; --card: #16181d; }
      }
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--fg); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: var(--muted); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: var(--btn-bg); color: var(--btn-fg); }
      .secondary { background: var(--card); color: var(--fg); border-color: var(--line); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
