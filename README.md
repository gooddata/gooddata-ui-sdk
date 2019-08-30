# GoodData.UI SDK

## Status

This repo is currently in cowboy development mode - tests may be failing. The `rush build` however must never fail.

Here is a list of (unordered) TODOs to address before we can start thinking about the release:

-   [ ] Make examples work & deploy; split live examples server into separate package

Current Status: Examples are split-off into examples/sdk-examples; they are not yet included in Rush; they may
not be buildable

-   [ ] Make releases work

Find out the right way to use Rush to create releases; initial research shows Rush is a bit flaky in
the area. If worst comes to worst, we may need to create our own release scripts (using release-it or
something like that)

-   [ ] Ensure package.json scripts are unified across projects; simplify them as needed
-   [ ] Remove all warnings during pnpm install

-   [ ] There are a bunch of `TODO: SDK8` comments in different parts of the code; all these should be addressed

## Contributing

### Getting started

1.  Install nvm; for instance: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
2.  Install Microsoft Rush: `npm i -g @microsoft/rush`
3.  Clone and bootstrap

    ```bash
    git clone git@github.com:lupko/gooddata-ui-sdk.git
    cd gooddata-ui-sdk
    nvm use
    rush install
    ```

4.  Build: `rush build`

### Contributor manual / FAQ

#### What is Rush?

Rush is an opinionated monorepo management tool that comes with batteries included. We strongly encourage you to
read the [official documentation](https://rushjs.io/pages/intro/welcome/).

#### Why rush and not lerna / yarn workspaces?

Several reasons:

1.  Rush (with help of PNMP) construct node_modules the correct way
2.  Product vs toolbox philosophy; Rush comes with an opinion and works in convention over configuration mode
3.  Good documentation, simple setup

#### Why PNPM and not Yarn or NPM?

PNPM has an interesting value proposition and in contrast with say Yarn actually delivers unique, useful
functionality on top of what is in NPM. We want to give it a try - after all it is proven to work well in large projects
at Microsoft.

You can read more about package managers in [this article](https://rushjs.io/pages/maintainer/package_managers/).

Also from a honest pragmatic point of view, Rush really only works well with PNMP; its Yarn support is experimental and
while it can work with NPM it needs some ancient version :)

#### How do I add new / update existing dependency in a subproject?

You must use Rush to add a new dependency. Navigate to the subproject and invoke:

```bash
rush add -p <package> --caret --make-consistent
```

for production dependencies or

```bash
rush add -p <package> --caret --dev
```

for developer dependencies.

With rare exceptions such as typescript package, all our dependencies use caret. Production dependencies must be kept
consistent across subprojects. This is the default mode, if you run into technical issues with that, we may make exceptions.

#### How do I build stuff?

To build everything, run `rush build`; this will trigger parallel execution of build scripts defined in each subproject's
`package.json`. Rush honors the dependencies between subprojects and will build them in correct order.

To build a single subproject with its dependencies:

```bash
rush build -t @gooddata/react-components
```

If you want to build _just_ single subproject, you can navigate to the subproject directory and invoke build using
npm:

```bash
npm run-script build
```

#### How do I publish new version of packages

TODO
