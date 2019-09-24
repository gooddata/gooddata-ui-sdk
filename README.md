# GoodData.UI SDK

## Status

This repo is currently in semi-cowboy development mode:

-   `rush build` must never fail
-   `npm run test` in sdk-ui must never fail; we will be stabilizing
-   tests in other packages and storybooks may fail for now
-   live examples may fail to compile (they are not managed by Rush)

Progress and tasks are tracked in RAIL-1791.

## Contributing

### Getting started

1.  Install nvm; for instance: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
2.  Install Microsoft Rush: `npm i -g @microsoft/rush`
3.  Make sure Python2 and c++ compile toolchain are installed on your machine
    These are needed to build native parts of the node-sass packages. If you do not have them installed then
    the `rush install` will fail once it downloads all packages and tries to install them.
4.  Clone and bootstrap

    ```bash
    git clone git@github.com:lupko/gooddata-ui-sdk.git
    cd gooddata-ui-sdk
    nvm use
    rush install
    ```

5.  Build: `rush build`

### After you pull latest changes

Always run `rush install`; this will make sure all the dependencies from the shrinkwrap file will be install in all
the projects managed in the repository.

In case the pull brings in new projects use `rush link --force` to ensure symlinks between dependent projects are
correctly created.

After that run `rush build`.

### Contributor manual / FAQ

#### What is Rush?

Rush is an opinionated monorepo management tool that comes with batteries included. We strongly encourage you to
read the [official documentation](https://rushjs.io/pages/intro/welcome/).

Long story short here are facts and commands you need to know:

-   lockfile (shrinkwrap file) is stored in pnpm-lock.yaml

-   the [common](common) directory contains Rush and project configuration including:

    -   [lockfile](common/config/rush/pnpm-lock.yaml)
    -   [git hooks scripts](common/git-hooks) which will be automatically installed by Rush
    -   [custom scripts](common/scripts) that can be integrated into

-   `rush install` - installs dependencies according to the lock file

-   `rush update` - conservatively install dependencies describes in package.json files, update lockfile
    This will only install / update dependencies that you have modified

-   `rush update --full` - install and update all dependencies according to the semver, update lockfile
    This is a more aggressive mode in which Rush will install and use latest applicable versions of packages, possibly
    resulting in a massive change to the lockfile. There is no need to run this as part

-   `rush build` - builds all the projects, in the right order, possibly skipping those that have no changes since
    the last build.

-   `rush link` and `rush link --force` - builds or rebuilds symlinks between projects in the repository

-   `rush add` - adds a new dependency to a project

#### Why Rush and not Lerna / Yarn workspaces?

Several reasons:

1.  Rush in conjuction with PNPM construct node_modules the correct way
2.  Product vs toolbox philosophy; Rush comes with an opinion and useful built-in functionality to tackle several
    problems related to managing external dependencies
3.  Good documentation, simple setup

That said if evidence mounts up indicating that Rush is not the right choice for this project, we will migrate
to Lerna, most likely Lerna + NPM.

#### Why PNPM and not Yarn or NPM?

PNPM has an interesting value proposition and in contrast with say Yarn actually delivers unique, useful
functionality on top of what is in NPM. We want to give it a try - it is proven to work well in large projects
at Microsoft.

You can read more about package managers in [this article](https://rushjs.io/pages/maintainer/package_managers/).

Also from a honest pragmatic point of view, Rush really only works well with PNMP; its Yarn support is experimental and
while it can work with NPM it needs some ancient version :)

#### How do I add new / update existing dependency in a project?

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

#### How do I remove dependencies from a project?

Simply remove the dependencies from package.json and then run `rush update --full`

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
npm run build
```

#### There are so many packages - where do I put my contributions?

Please go ahead and familiarize yourself with the GoodData.UI SDK architecture, layering and packaging design
which are all documented in our [Developer's Guide](docs/sdk-dev.md).

If you are still in doubt, ask.

#### How do I create a new package?

Before proceeding, first ask yourself:

-   Why does the contribution not fit into an existing package? (see [Developer's Guide](docs/sdk-dev.md))
-   Which of the existing packages is closest fit for the contribution? Why does the contribution not fit in there? (see [Developer's Guide](docs/sdk-dev.md))

Once you have answers to these questions and still feel a new package is needed, get in touch for approval before
proceeding.

After that, we have a couple of skeleton projects to bootstrap development of new SDK packages. See [skel](skel) directory for
more information. Bear in mind the naming conventions described in the developer's guide.

#### How do I publish new version of packages

TODO

### Troubleshooting

#### `rush build` gives me error TS2307: Cannot find module '@gooddata/sdk-backend-spi'.

This might be caused by corrupted symlinks. Try running `rush link --force` to recreate them. After that, everything should work fine.
