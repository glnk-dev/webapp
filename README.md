# WebApp

[![Build and Deploy app to GitHub Pages](https://github.com/glnk-dev/webapp/actions/workflows/deploy-pages.yaml/badge.svg)](https://github.com/glnk-dev/webapp/actions/workflows/deploy-pages.yaml)

This repository contains the React-based web application for managing custom short links with [glnk.dev](https://glnk.dev).
The application is built and deployed to GitHub Pages using GitHub Actions.

## Features

- Custom short link management
- Redirection map generation
- Multiple access modes (static, public, private, homepage)
- Firebase authentication integration
- Easy deployment to GitHub Pages
- Environment variable support

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or higher)

### Install the dependencies:

```bash
npm install
```

### Running Locally

The application supports multiple access modes. To run locally, you need to set up environment variables based on the mode you want to use.

#### Available Modes

- **homepage**: Signup page for glnk.dev (no username required)
- **static**: Read-only mode
- **public**: Login to edit mode
- **private**: Login required mode

#### Environment Setup

Create environment files based on the mode you want to use:

**For homepage mode** (`.env.homepage`):

```env
REACT_APP_GLNK_USERNAME=
REACT_APP_GLNK_ACCESS_MODE=homepage
REACT_APP_FIREBASE_API_KEY=<your-firebase-api-key>
REACT_APP_FIREBASE_APP_ID=<your-firebase-app-id>
PUBLIC_URL=/webapp
```

**For user site modes** (`.env.private`, `.env.public`, `.env.static`):

```env
REACT_APP_GLNK_USERNAME=<your-glnk-username>
REACT_APP_GLNK_ACCESS_MODE=<static|public|private>
REACT_APP_FIREBASE_API_KEY=<your-firebase-api-key>
REACT_APP_FIREBASE_APP_ID=<your-firebase-app-id>
PUBLIC_URL=/webapp
```

### Start the development server:

```bash
# Homepage mode
npm run start:homepage

# Private mode (login required)
npm run start:private

# Public mode (login to edit)
npm run start:public

# Static mode (read-only)
npm run start:static

# Default (uses .env file)
npm start
```

### Building for Production

To create a production build of the application, run:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Deployment

This repository is configured to use GitHub Actions to deploy the application to GitHub Pages. The workflow will automatically run when you push changes to the main branch.

### GitHub Actions Workflow

The repository includes:

- **`action.yaml`**: Defines a composite GitHub Action for building and deploying the web app. This action:

  - Authenticates with Google Cloud using Workload Identity Federation
  - Retrieves secrets from Google Secret Manager (Firebase credentials, GitHub App credentials)
  - Checks out the community repository for user-specific URL maps
  - Builds and deploys to GitHub Pages

- **`.github/workflows/deploy-pages.yaml`**: Configures the workflow to trigger on pushes to the main branch or manually via `workflow_dispatch`.

### Action Inputs

The composite action accepts the following inputs:

- `GLNK_USERNAME`: Your GitHub username (used as subdomain: username.glnk.dev). Not required for homepage mode.
- `GLNK_ACCESS_MODE`: Site mode - `static` (read-only), `public` (login to edit), `private` (login required), `homepage` (glnk.dev signup page). Default: `static`.
- `GLNK_PUBLIC_URL`: Custom domain URL (leave empty for default username.glnk.dev). Default: empty.
- `GLNK_PATH_SEGMENTS`: Number of path segments to preserve for SPA routing (0 for root domain). Default: `0`.
