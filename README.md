# GoodData.UI SDK

## Status

This repository contains the beta version of the upcoming 8.0.0 release of GoodData.UI SDK. While the beta version is
at this point 99% feature-complete it is still undergoing testing and there are known defects. It is not suitable for
production use.

## Getting Started

Easiest way to start developing analytical applications using GoodData.UI SDK is to use
the [Accelerator Toolkit for v8](https://github.com/gooddata/gooddata-create-gooddata-react-app/tree/sdk8). You will
be up and running in minutes.

For detailed description of available components and capabilities see the [official documentation](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).

You can also register to our [live examples](https://gooddata-examples.herokuapp.com/login) and then start the live examples
[application locally](examples/sdk-examples).

## Contributing

### Getting started

1.  Install nvm; for instance: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
2.  Clone and bootstrap

    ```bash
    git clone git@github.com:gooddata/gooddata-ui-sdk.git
    cd gooddata-ui-sdk
    nvm install
    nvm use
    npm i -g @microsoft/rush pnpm
    rush install
    ```

3.  Build: `rush build`

### After you pull latest changes

Always run `rush install`; this will make sure all the dependencies from the lock file will be installed in all
the projects managed in the repository. After that run `rush build`.

In case the pull brings in new projects or large bulk of changes, it is safer (albeit more time-consuming) to run
`rush install && rush link --force && rush clean && rush rebuild`.

### Contributor manual / FAQ

#### Rush primer

Rush is an opinionated monorepo management tool that comes with batteries included. We strongly encourage you to
read the [official documentation](https://rushjs.io/pages/intro/welcome/).

Long story short here are facts and commands you need to know:

-   lock file (shrinkwrap file) is stored in pnpm-lock.yaml.

-   Rush maintains internal registry of packages in common/temp; all package dependencies are symlinked; projects
    within the monorepo are also symlinked

-   the [common](common) directory contains Rush and project configuration including:

    -   [lockfile](common/config/rush/pnpm-lock.yaml)
    -   [git hooks scripts](common/git-hooks) which will be automatically installed by Rush
    -   [custom scripts](common/scripts) that can be integrated into

-   `rush install` - installs dependencies according to the lock file.

-   `rush update` - conservatively install dependencies describes in package.json files, update lockfile
    This will only install / update dependencies that you have modified.

-   `rush update --full` - install and update all dependencies according to the semver, update lockfile
    This is a more aggressive mode in which Rush will install and use latest applicable versions of packages, possibly
    resulting in a massive change to the lockfile. There is no need to run this as part of typical feature
    development.

-   `rush build` - builds all the projects, in the right order, possibly skipping those that have no changes since
    the last build.

-   `rush link` and `rush link --force` - builds or rebuilds symlinks between projects in the repository.
    This is typically not needed as Rush will re-link during update. Use in case you encounter strange dependency
    errors during build.

-   `rush add` - adds a new dependency to a project.

> Note: Rush by default tries to use all cores available on the machine. It is possible to override this using
> the `--parallelism` option on the CLI or using the `RUSH_PARALLELISM` environment variable.

#### Bulk projects commands

On top of Rush built-in commands, we have added our own custom commands (see [command-line.json](common/config/rush/command-line.json)):

| Command               | Description                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `rush audit`          | Performs security audit of all packages listed in global lock file                                          |
| `rush clean`          | Cleans up artifacts created by build and tests. Cleans Jest caches. Full 'rebuild' required after cleaning. |
| `rush validate`       | Validates code in all projects.                                                                             |
| `rush validate-ci`    | Validates code in all projects in CI mode.                                                                  |
| `rush test-once`      | Tests code in all projects.                                                                                 |
| `rush test-ci`        | Tests code in all projects in CI mode with coverage reporting.                                              |
| `rush dep-cruiser`    | Runs dependency-cruiser in all projects.                                                                    |
| `rush dep-cruiser-ci` | Runs dependency-cruiser in CI mode in all projects. This creates HTML reports                               |
| `rush prettier-check` | Verifies code formatting in all projects.                                                                   |
| `rush prettier-write` | Formats code in all projects.                                                                               |
| `rush populate-ref`   | Makes projects populate reference workspace with recording definitions.                                     |

#### How do I add new / update existing dependency in a project?

You must use Rush to add a new dependency to a project and use the `make-consistent` parameter. This parameter
will make Rush update all other projects that already use the package to also use the desired version.

Navigate to the subproject and invoke:

```bash
rush add -p <package>@^<version> --make-consistent
```

to add a new production dependency. Add the `--dev` flag to add the package as dev dependency instead.

With rare exceptions such as typescript package, all our dependencies use caret. Dependencies must be kept
consistent across subprojects.

> Note: **never** add new packages by running package manager directly (e.g. `yarn add ...`).
> This will break the node_modules.

#### How do I remove dependencies from a project?

Remove the dependencies from package.json and then run `rush update`.

#### How do I build stuff?

To build everything, run `rush build`; this will trigger parallel execution of build scripts defined in each subproject's
`package.json`, starting them in the correct order - honoring the inter-package dependencies.

Rush build is incremental and will only build projects which have changed since the last build. This is
safe and preferred way to build. In rare cases such as large refactorings or refactorings of SCSS styles you should
perform clean & rebuild: `rush clean && rush rebuild`

To build a single subproject with its dependencies:

```bash
rush build -t @gooddata/sdk-ui
```

If you want to build _just_ single subproject, you can navigate to the subproject directory and invoke build using
`rushx`:

```bash
rushx build
```

> Hint: starting package.json **scripts** using npm/yarn/pnpm also works and there is nothing wrong with it.

#### Where do I put my contributions?

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

#### How do I describe my changes for the CHANGELOG?

Run `rush change` and follow the instructions. Run this after any significant block of work (one or more commits) that you want to mention in the changelog. Think of this as a condensed commit message. You should probably run this after you have your PR ready for review and you have squashed your commits. Run the `rush change` and amend your final commit with the results. This will create files in `common/changes`. Commit these files, they will be used during release to generate CHANGELOG automatically.

There will probably be a check step in the future that will make sure you ran the `rush change` command.

#### How do I publish new version of packages?

For detailed description of the release process, please see [Release process](docs/releases.md).

### Troubleshooting

#### `rush build` gives me error TS2307: Cannot find module '@gooddata/sdk-backend-spi'.

This might be caused by corrupted symlinks. Try running `rush link --force` to recreate them. After that, everything should work fine.

## CI jobs and gating

Every pull-request can be merged by adding `merge` label. This triggers test scripts and once they pass, the pull-request is automatically merged. All related scripts run in docker, see `./common/scripts/ci/` for individual scripts being run on jenkins slaves.
