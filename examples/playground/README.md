# GoodData.UI SDK - Developer Playground

This project contains a minimalistic application that you can use while developing and dev-testing a component. The application
only takes care of setting the backend and workspace context. Everything else is up to you.

Because the playground is part of the monorepo, all the SDK dependencies are linked into the app.
You can then benefit from a very convenient experience such as:

1.  Start the playground in dev mode - `npm run dev`
2.  Add your own component into the playground, this component exercises let's say contents of `@gooddata/sdk-ui-dashboard`
3.  Edit any file in the repository and it will be immediately reflected in the playground with hot reload.

## Set environment variables

To make the playground work, you should set the following environment variables either via command line or by
creating `.env` file based on `.env.template`. Note that `VITE_DASHBOARD` variable is optional.

```
VITE_BACKEND_URL=<your-backend-url>
VITE_TIGER_API_TOKEN=<your-token>
VITE_WORKSPACE=<your-workspace>
VITE_DASHBOARD=<your-dashboard>
```
