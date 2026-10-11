This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Metadata, link previews and Open Graph images

The site is a client-side React app, and link crawlers (WhatsApp, iMessage, Slack, X, Google) do not run JavaScript. To give every page its own title, description and preview image, metadata is generated as static HTML at build time.

### How it works

- `scripts/meta.js` is the single source of truth for page metadata: `<title>`, `description`, canonical URL, Open Graph, Twitter card and a `VisualArtwork` JSON-LD block for each work.
- `scripts/prerender.js` runs automatically after `react-scripts build` (see the `build` script in `package.json`). It rewrites `build/index.html` with the home metadata, writes `build/work/<slug>/index.html` for every work in `src/data/images.js`, and writes `build/sitemap.xml` with the home page and all visible works.
- nginx on the server uses `try_files $uri $uri/ /index.html`, so `/work/<slug>` is served from the prerendered directory and the React app takes over on load. Unknown routes still fall back to `index.html`.
- `public/og/<slug>.jpg` are 1200x630 preview images, one per work, plus `public/og/home.jpg` (a grid of the first six visible works). They are committed to the repo so CI never downloads source images. Each file is kept under 280 KB, which is what WhatsApp accepts.
- `Gallery.js` and `PaintingPage.js` also set `document.title` on the client so the tab title follows in-app navigation.
- `public/index.html` carries the home metadata as a default for `yarn start`; the prerender step replaces it in production builds.

### Adding a new work

1. Add the entry to `src/data/images.js` and upload the large image to S3 as usual.
2. Run `yarn og-images` (requires ImageMagick 7, `brew install imagemagick`). It downloads missing source images into `.cache/og-src/` (gitignored), generates only the preview images that do not exist yet, and skips the rest. Use `node scripts/og-images.js --force` to regenerate everything, including `home.jpg`.
3. Commit the new file in `public/og/`. The prerendered page and the sitemap entry are produced by `yarn build` on deploy. A work without an OG image falls back to `home.jpg`.

### Testing locally

```sh
yarn build
sed 's/></>\n</g' build/work/milagre/index.html | grep -E 'og:|twitter:|<title'
cat build/sitemap.xml
```

To check what a crawler sees in production, use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or `curl -L https://gustavosaiani.art.br/work/milagre | grep og:image`. WhatsApp caches previews per URL, so a changed image may need a new URL or a cache refresh in the debugger.

### Scripts

| Script | What it does |
| --- | --- |
| `yarn build` | Production build, then prerender per-route HTML and the sitemap |
| `yarn og-images` | Generate missing Open Graph images into `public/og/` |
| `node scripts/og-images.js --force` | Regenerate all Open Graph images |

No new environment variables are required.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
