# GoodData.UI SDK - Developer Playground

This project contains a minimalistic application that you can use while developing and dev-testing a component. The application
only takes care of setting the backend and workspace context. Everything else is up to you.

Because the playground is part of the monorepo, all the SDK dependencies are linked into the app.
You can then benefit from a very convenient experience such as:

1.  Start the playground in dev mode - `npm run dev`
2.  Edit [`src/playground/Playground.tsx`](./src/playground/Playground.tsx) to include your component under development.
3.  Edit any file in the repository, and it will be immediately reflected in the playground with hot reload.

## Making Git ignore changes in the playground

The `src/playground` folder is excluded through [`.gitignore`](.gitignore),
and `Playground.tsx` file was force-added back to git.

Any new files you're creating in the `src/playground` should be ignored by default.

In order to ignore changes in the `Playground.tsx` file itself, you can run the following command:

```bash
cd examples/playground
git update-index --skip-worktree src/playground/Playground.tsx
```

## Set environment variables

To make the playground work, you should set the following environment variables either via command line or by
creating `.env` file based on `.env.template`. Note that `VITE_DASHBOARD` variable is optional.

```
VITE_BACKEND_URL=<your-backend-url>
VITE_TIGER_API_TOKEN=<your-token>
VITE_WORKSPACE=<your-workspace>
VITE_DASHBOARD=<your-dashboard>
VITE_MKCERT=false
```

`VITE_MKCERT` is a flag that tells the playground to use a self-signed certificate. `vite-plugin-mkcert` plugin
requires `sudo` privileges to create a certificate on UNIX systems. If you don't want to use it, set the flag to `false`.
