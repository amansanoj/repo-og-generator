[![OG Preview](https://repo-og-generator.vercel.app/repo-og-generator?description=Instantly%20generate%20beautiful%2C%20dynamic%20social%20share%20images%20for%20your%20GitHub%20projects.&url=repo-og-generator.vercel.app&scale=2)](https://repo-og-generator.vercel.app)

A serverless API that generates **Open Graph images** on the fly for GitHub repositories. Built with [Hono](https://hono.dev), [Satori](https://github.com/vercel/satori), and deployed on [Vercel](https://vercel.com).

## Usage

```
https://repo-og-generator.vercel.app/{repo-name}?description=...&url=...
```

| Parameter     | Description                           | Default   |
|---------------|---------------------------------------|-----------|
| `description` | Short description of the project      | _(empty)_ |
| `url`         | URL to display on the image           | _(empty)_ |
| `variant`     | Color variant: `primary` or `accent`  | `primary` |
| `scale`       | Output scale multiplier (0.1 – 3)     | `1`       |

## Features

- Generates PNG images at 1200×630
- Two color variants (primary + accent), with and without URL
- Custom Rubik font bundled at build time
- Simple homepage UI to preview and copy image URLs

## Project Structure

- `api/index.ts` – Vercel serverless handler (image generation + homepage)
- `public/` – Background SVGs and fonts bundled with the function

## Development

```bash
bun install         # install dependencies
bunx vercel dev     # start local dev server
bunx vercel --prod  # deploy to production
```

## Customization

To self-host with your own branding:

1. **Fork** this repository and clone it locally
2. **Replace the background SVGs** in `public/` — there are 4 files:
   - `primary.svg` / `primary-link.svg` — default color variant
   - `accent.svg` / `accent-link.svg` — alternate color variant  
   The link variants include a URL bar element at the bottom. All are 1200×630px.

   You can import any of these into **Figma** to redesign them with your own branding, then export back as SVG. Once replaced, update the `left`, `top`, and `width` values for the text elements in `api/index.ts` to match where your design places the text — search for the `position: 'absolute'` style blocks inside the `children` array.
3. **Replace the fonts** in `public/` with your own `.ttf` files, then update the import paths and font names in `api/index.ts`
4. **Update the text colors** in `api/index.ts` — look for `textColor` which maps variants to hex values
5. **Deploy** to Vercel:
   ```bash
   bunx vercel --prod
   ```

Then use your deployed URL in place of `repo-og-generator.vercel.app`.