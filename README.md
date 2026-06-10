# Ludo React - No-Build Version

A purely "serverless" and static version of the Ludo game. This version has **no npm dependencies**, **no build step**, and runs directly in the browser using native ES Modules and CDNs.

## Features
- **Zero Build**: No `npm install` or `npm run build` required.
- **Purely Static**: Can be hosted on any static file host (GitHub Pages, Netlify, Vercel, etc.) by just uploading the files.
- **P2P Multiplayer**: Uses PeerJS for direct browser-to-browser communication.
- **React + htm**: Built with React 19 and `htm` for JSX-like syntax without a transpiler.
- **Tailwind CSS**: Uses the Tailwind Play CDN for styling.

## How to Run Locally
1. Clone the repository.
2. Open `index.html` in a local web server (e.g., VS Code Live Server, or `python -m http.server`).
   - *Note: Native ES Modules require a local server and won't work if opened via `file://` protocol.*

## Deployment
Since this project is entirely static, you can deploy it to GitHub Pages by simply pushing to the `master` branch and enabling GitHub Pages in the repository settings.

## Technology Stack
- [React 19](https://react.dev/) (via ESM CDN)
- [PeerJS](https://peerjs.com/) (P2P Networking)
- [htm](https://github.com/developit/htm) (JSX-like templates)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [Lucide](https://lucide.dev/) (Icons)
