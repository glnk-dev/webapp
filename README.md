# WebApp

[![Build and Deploy app to GitHub Pages](https://github.com/glnk-dev/webapp/actions/workflows/deploy-pages.yaml/badge.svg)](https://github.com/glnk-dev/webapp/actions/workflows/deploy-pages.yaml)

This repository contains the React-based web application for managing custom short links with [glnk.dev](https://glnk.dev).
The application is built with Vite and deployed to GitHub Pages using GitHub Actions.

## Features

| Feature                       | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| **Short Link Management**     | Create and manage custom short links                            |
| **Redirection Maps**          | Generate and manage URL redirection maps                        |
| **Multiple Access Modes**     | Support for `static`, `public`, `private`, and `homepage` modes |
| **Firebase Authentication**   | Integrated Firebase authentication for secure access            |
| **GitHub Pages Deployment**   | Automated deployment via GitHub Actions                         |
| **Environment Configuration** | Flexible environment variable support for different modes       |

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

| Mode       | Description              | Username Required |
| ---------- | ------------------------ | ----------------- |
| `homepage` | Signup page for glnk.dev | No                |
| `static`   | Read-only mode           | Yes               |
| `public`   | Login to edit mode       | Yes               |
| `private`  | Login required mode      | Yes               |

#### Environment Setup

Create environment files based on the mode you want to use:

| Variable                 | Homepage Mode             | User Site Modes                   | Description                       |
| ------------------------ | ------------------------- | --------------------------------- | --------------------------------- |
| `VITE_GLNK_USERNAME`     | (empty)                   | `<your-glnk-username>`            | GitHub username used as subdomain |
| `VITE_GLNK_ACCESS_MODE`  | `homepage`                | `static` \| `public` \| `private` | Site access mode                  |
| `VITE_FIREBASE_API_KEY`  | `<your-firebase-api-key>` | `<your-firebase-api-key>`         | Firebase API key                  |
| `VITE_FIREBASE_APP_ID`   | `<your-firebase-app-id>`  | `<your-firebase-app-id>`          | Firebase App ID                   |

**Example for homepage mode** (`.env.homepage`):

```env
VITE_GLNK_ACCESS_MODE=homepage
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_APP_ID=<your-firebase-app-id>
```

**Example for user site modes** (`.env.private`, `.env.public`, `.env.static`):

```env
VITE_GLNK_USERNAME=<your-glnk-username>
VITE_GLNK_ACCESS_MODE=<static|public|private>
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_APP_ID=<your-firebase-app-id>
```

### Start the development server:

| Command                | Mode       | Description              |
| ---------------------- | ---------- | ------------------------ |
| `npm run dev:homepage` | `homepage` | Signup page for glnk.dev |
| `npm run dev:private`  | `private`  | Login required mode      |
| `npm run dev:public`   | `public`   | Login to edit mode       |
| `npm run dev:static`   | `static`   | Read-only mode           |
| `npm run dev`          | Default    | Uses `.env` file         |

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

| Input                | Required | Default  | Description                                                                                                              |
| -------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `GLNK_USERNAME`      | No       | `""`     | GitHub username (used as subdomain: username.glnk.dev). Not required for homepage mode.                                  |
| `GLNK_ACCESS_MODE`   | No       | `static` | Site mode: `static` (read-only), `public` (login to edit), `private` (login required), `homepage` (glnk.dev signup page) |
| `GLNK_PUBLIC_URL`    | No       | `""`     | Base URL path for subpath deployments (e.g., `/webapp` for github.io)                                                    |
| `GLNK_PATH_SEGMENTS` | No       | `0`      | Number of path segments to preserve for SPA routing (0 for root domain)                                                  |
