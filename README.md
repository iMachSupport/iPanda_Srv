# iPanda_Srv

Enterprise AI coworker agent runtime platform for SAP ecosystems.

## Overview

`iPanda_Srv` is a TypeScript-based backend service built with Express. It provides a modular agent runtime, knowledge service, LLM provider integration, SAP connector support, and tool registry functionality.

## Requirements

- Node.js 20 or later
- npm

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run in development mode:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Start the compiled server:

```bash
npm start
```

## Configuration

The service loads environment configuration from a `.env` file. Example values are provided in `.env.example`.

## API

- Health check: `GET /health`
- API root: `/{API_PREFIX}/{API_VERSION}`

Routes are mounted under the configured API prefix and version from `src/config/environment.ts`.

## Scripts

- `npm run dev` - Starts the server with `tsx watch`.
- `npm run build` - Compiles TypeScript using `tsc`.
- `npm run start` - Runs the compiled server from `dist/server.js`.
- `npm run typecheck` - Runs TypeScript type checking without emitting files.

## Project Structure

- `src/` - Application source code
- `src/app.ts` - Express app setup
- `src/server.ts` - Application bootstrap
- `src/composition/` - Dependency container
- `src/config/` - Environment and configuration
- `src/modules/` - Feature modules
- `src/routes/` - Express routes
- `src/shared/` - Shared utilities and middleware

## License

This project is private.
