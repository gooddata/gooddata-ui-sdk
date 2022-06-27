# GoodData.UI SDK - Developer Playground

This project contains a minimalistic application that you can use while developing and dev-testing a component. The application
only takes care of setting the backend and workspace context. Everything else is up to you.

The project uses webpack with configuration similar to that of the sdk-examples. Because the playground is part of the
monorepo, all the SDK dependencies are linked into the app. You can then benefit from a very convenient experience such as:

1.  Start the playground in dev mode - `npm run play`
2.  Add your own component into the playground, this component exercises let's say contents of `@gooddata/sdk-ui-charts`
3.  Start the dev mode in the `libs/sdk-ui-charts` - `npm run dev`

    > Note: if you are making changes to multiple SDK packages, then you may find the applink "autoBuild" mode extra
    > useful. Please check out documentation for [applink tool](../../tools/applink).

Once you do this, every time you make a change in the `sdk-ui-charts`, the dev mode will do incremental build, populate
the `esm` outputs. The webpack server in the playground will be notified of this and rebuild the playground
automatically.

## Available backends and authentication

By default, the `npm run play` will run on top of the public access proxy that is set up on top of the live
examples workspace. You can start playing around immediately and not worry about authentication.

Other backends are also available. Check out the [webpack.config.js](webpack.config.js) for a list of choices. All
backends except the `public` one require authentication.

In order to get the login screen out of the way, the playground requires that you specify username and password in
the `.env` file. Set the `GDC_USERNAME` and `GDC_PASSWORD` variables in the `.env` file. The playground will pick them
up and will use these automatically when it needs to authenticate the session.

NOTE: the `.env` file is already ignored and will not land in commit.

## Run with why-did-you-render

For solving re-rendering issues you can use `npm run playWithWdyr` using [why-did-you-render library](https://www.npmjs.com/package/@welldone-software/why-did-you-render).

In `src/index.ts` you can find a WDYR library configuration. This is the spot you need to update for your needs. See the
the [option section]("https://www.npmjs.com/package/@welldone-software/why-did-you-render#options") of the documentation.
