# WebApp

[![Build and Deploy app to GitHub Pages](https://github.com/glnk-dev/webapp/actions/workflows/deploy-pages.yaml/badge.svg)](https://github.com/glnk-dev/webapp/actions/workflows/deploy-pages.yaml)

This repository contains the React-based web application for managing custom short links with [glnk.dev](https://glnk.dev). 
The application is built and deployed to GitHub Pages using GitHub Actions.

## Features

- Custom short link management
- Redirection map generation
- Easy deployment to GitHub Pages
- Environment variable support

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)

### Install the dependencies:
```
npm install
```
### Running Locally
1. To run the application locally, you need to set up environment variables.
2. Create a .env file in the root of the project and add the following:
```
REACT_APP_GLNK_USERNAME=<your-glnk-username>
PUBLIC_URL=/webapp
```
### Start the development server:
```
npm start
```

### Building for Production
To create a production build of the application, run:

```
npm run build
```
The build artifacts will be stored in the `build/` directory.

## Deployment
This repository is configured to use GitHub Actions to deploy the application to GitHub Pages. The workflow will automatically run when you push changes to the main branch.

### GitHub Actions Workflow
The repository includes two workflow files:

- `action.yaml`: Defines a composite GitHub Action for building and deploying the web app.
- `deploy.yaml`: Configures the workflow to trigger on pushes to the main branch or manually via `workflow_dispatch`.
