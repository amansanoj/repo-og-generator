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
- Provides customizable color variants like primary and accent design templates
- Ships with an integrated homepage UI to directly preview and copy generated URLs
- Bundles fonts natively during the build phase to ensure perfect layout rendering

## Project Structure
```text
.
├── .gitignore
├── LICENSE
├── README.md
├── api
│   └── index.ts
├── bun.lock
├── package.json
├── public
│   ├── Rubik-Regular.ttf
│   ├── Rubik-SemiBold.ttf
│   ├── accent-link.svg
│   ├── accent.svg
│   ├── og-home.png
│   ├── primary-link.svg
│   └── primary.svg
├── tsconfig.json
└── vercel.json
```
The codebase strictly relies on `api/index.ts` to coordinate image generation, leveraging SVG designs and font files mapped out in the `public/` directory for compositing.

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
