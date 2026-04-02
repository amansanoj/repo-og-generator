![OG Image](https://repo-og-generator.vercel.app/repo-og-generator?description=A%20serverless%20API%20designed%20to%20generate%20beautiful%2C%20dynamic%20social%20share%20Open%20Graph%20images%20instantly%20for%20GitHub%20repositories.&scale=2)

## Index
- [Features](#features)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Credits & License](#credits--license)

## Features
- Generates 1200x630 resolution PNG share images on the fly via serverless execution
- Supports dynamic query parameters including description, output scale, and URL
- Provides customizable color variants like primary and secondary design templates
- Ships with an integrated homepage UI to directly preview and copy generated URLs
- Bundles fonts natively during the build phase to ensure perfect layout rendering

## Project Structure
```text
.
├── .gitignore
├── LICENSE
├── README.md
├── api
│   ├── index.ts
│   └── lib
│       ├── assets.ts
│       ├── config.ts
│       ├── query.ts
│       └── render-og.ts
├── bun.lock
├── package.json
├── public
│   ├── index.html
│   ├── favicon.svg
│   ├── OpenSans-Regular.ttf
│   ├── OpenSans-Bold.ttf
│   ├── secondary-link.svg
│   ├── secondary.svg
│   ├── og-home.png
│   ├── primary-link.svg
│   └── primary.svg
├── tsconfig.json
└── vercel.json
```
`api/index.ts` is now a thin router. Most customization lives in `api/lib/config.ts`.

## Fork Customization (Quick Path)
For most forks, edit only `api/lib/config.ts`:

- `appConfig.files.fonts`: switch to your own font filenames
- `appConfig.files.variants`: map your variant names to SVG files; the homepage radios are generated from this list automatically
- The homepage variant radios are hydrated from `api/config.ts`, so updating the variants list there updates the UI too
- `appConfig.og.textColor`: set global text color
- `appConfig.og.layout`: adjust x/y/width/line-height positions
- `appConfig.og.minScale` / `maxScale`: change allowed scale range
- Color values come from `@amansanoj/brand` through `api/lib/brand.ts` and `/api/brand-css`; swap that package if you want a different palette

Then replace visual assets in `public/`:

- `public/primary.svg`, `public/primary-link.svg`
- `public/secondary.svg`, `public/secondary-link.svg`
- `public/index.html` (homepage content/styles)
- `public/favicon.svg`

## Local Development
To customize the generator or run your own instance locally, ensure you have Bun installed and use the Vercel CLI to boot the serverless environment:

```sh
bun install
bunx vercel dev
```

## Deployment
Deployment is streamlined via Vercel. After modifying the core functionality, font assets, or SVG backgrounds, you can push the serverless function directly to production:

```sh
bunx vercel --prod
```
The application will instantly become available. When hosting your own fork, you can replace the deployed URL to consume the updated design logic.

## Credits & License
Constructed using Satori and Hono. This codebase is open-source. Please check the included LICENSE file for redistribution rights and terms.
