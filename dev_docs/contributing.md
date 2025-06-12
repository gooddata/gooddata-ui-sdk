# Contributor manual / FAQ

We are happy that you are considering contribution to GoodData.UI SDK. Before proceeding, please familiarize yourself
with the technical aspects of the contribution. This document gives overview how to build and test the SDK and perform
other typical tasks related to contributing.

## Environment Requirements

The development process is tested on macOS and Linux and uses bash for some of the scripting.
This means that some parts of the development process will not work on Windows.
You can use [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
but note that this mode of development is not tested and not supported by our teams.

## Getting started

1.  Install [nvm](https://github.com/nvm-sh/nvm)
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
    ```
2.  Clone and bootstrap

    ```bash
    git clone git@github.com:gooddata/gooddata-ui-sdk.git
    cd gooddata-ui-sdk
    nvm install
    nvm use
    npm i -g @microsoft/rush
    rush install
    ```

3.  Build

    ```bash
    rush build
    ```

4.  Read the rest of this guide and also the [developer guide](./sdk-dev.md).

**HINT**: The repository includes the `.envrc` configuration file for [direnv](https://direnv.net/); you can use this
to auto-nvm-use the correct node.js installation every time you enter the `gooddata-ui-sdk` directory.

## After you pull latest changes

Always run `rush install`; this will make sure all the dependencies from the lock file will be installed in all
the projects managed in the repository. After that run `rush build`.

In case the pull brings in new projects or large bulk of changes, it is safer (albeit more time-consuming) to run
`rush clean && rush purge && rush install && rush rebuild`.

## IDE Settings

Please check out [How to setup IntelliJ](setupIntellij.md) guide to find out about recommended settings for IntelliJ IDEA or [How to setup VS Code](setupVsCode.md) guide to find out about recommended settings for VS Code.

## Rush primer

Rush is an opinionated monorepo management tool that comes with batteries included. We strongly encourage you to
read the [official documentation](https://rushjs.io/pages/intro/welcome/).

Long story short, here are facts and commands you need to know:

-   lock file (shrinkwrap file) is stored in pnpm-lock.yaml.

-   Rush maintains internal registry of packages in common/temp; all package dependencies are symlinked; projects
    within the monorepo are also symlinked.

-   the [common](common) directory contains Rush and project configuration including:

    -   [lockfile](common/config/rush/pnpm-lock.yaml)
    -   [git hooks scripts](common/git-hooks) which will be automatically installed by Rush
    -   [custom scripts](common/scripts) that can be integrated into

-   `rush install` - installs dependencies according to the lock file.

-   `rush update` - conservatively install dependencies describes in package.json files, update lockfile.

    This will only install / update dependencies that you have modified.

-   `rush update --full` - install and update all dependencies according to the semver, update lockfile.

    This is a more aggressive mode in which Rush will install and use latest applicable versions of packages, possibly
    resulting in a massive change to the lockfile. There is no need to run this as part of typical feature
    development.

-   `rush build` - builds all the projects' ESM and CommonJS builds, in the right order, possibly skipping those that have no changes since
    the last build.

-   `rush link` and `rush link --force` - builds or rebuilds symlinks between projects in the repository.

    This is typically not needed as Rush will re-link during update. Use in case you encounter strange dependency
    errors during build.

-   `rush add` - adds a new dependency to a project.

**IMPORTANT**: When `rush` runs builds in the projects it will truncate the project's build outputs when emitting to
console. It will, however, store full build output into each project's directory. It will create files `<projectId>.build.log`
and this will contain the full build output.

> Note: Rush by default tries to use all cores available on the machine. It is possible to override this using
> the `--parallelism` option on the CLI or using the `RUSH_PARALLELISM` environment variable.

### Bulk projects commands

On top of Rush built-in commands, we have added our own custom commands (see [command-line.json](common/config/rush/command-line.json)):

| Command               | Description                                                                             |
| --------------------- | --------------------------------------------------------------------------------------- |
| `rush audit`          | Performs security audit of all packages listed in global lock file                      |
| `rush purge`          | Delete all installed npm modules, clean temp and node_modules directories               |
| `rush clean`          | Cleans up artifacts created by build and tests. Full 'rebuild' required after cleaning. |
| `rush validate`       | Validates code in all projects.                                                         |
| `rush validate-ci`    | Validates code in all projects in CI mode.                                              |
| `rush test-once`      | Tests code in all projects.                                                             |
| `rush test-ci`        | Tests code in all projects in CI mode with coverage reporting.                          |
| `rush dep-cruiser`    | Runs dependency-cruiser in all projects.                                                |
| `rush dep-cruiser-ci` | Runs dependency-cruiser in CI mode in all projects. This creates HTML reports           |
| `rush prettier-check` | Verifies code formatting in all projects.                                               |
| `rush prettier-write` | Formats code in all projects.                                                           |
| `rush populate-ref`   | Makes projects populate reference workspace with recording definitions.                 |

## How do I...?

This section should answer most of the contribution questions for the practical side of things.

### How do I add new / update existing dependency in a project?

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

After adding new dependency run `rush update` to approve new package.

### How do I remove dependencies from a project?

Remove the dependencies from package.json and then run `rush update`.

### How do I build stuff?

To build everything, run `rush build`; this will trigger parallel execution of build scripts defined in each subproject's
`package.json`, starting them in the correct order - honoring the inter-package dependencies.

Rush build is incremental and will only build projects which have changed since the last build. This is
safe and preferred way to build. In rare cases such as large refactors or refactors of SCSS styles you should
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

> Hint: if you find that the `rush build` makes your system unresponsive, you can try tweaking (lowering) the parallelism,
> either by using the `-p` parameter of `rush build`, or by setting the `RUSH_PARALLELISM` environment variable.

### What should the commits look like?

Commits should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
Following format and rules are enforced by CI checks.

Example:

```
feat(sdk-model): clarify attribute area sort

-  the attribute sort aggregation switches the attribute sort into
   area sort
-  having a 'flag' or 'aggregation' on a newAttributeSort factory seemed
   confusing while I tried to explain this in docs
-  it is more clear if the area sort has separate factory - even if it
   creates the same type.
-  but this way, the intent is cleaner
-  also, the aggregation: boolean was not good, this is indeed a function that may one day support more

risk: low
JIRA: RAIL-2175
```

Commit message structure:

```
<type>(<scope>): <description>

<body>

<footer>
```

#### Type

Must be one of the following:

-   `feat` - A new feature
-   `fix` - A bug fix of existing feature
-   `build` - Changes that affect the build system or auxiliary tools and libraries such as eslint or prettier
-   `ci` - Changes to our CI configuration files and scripts
-   `docs` - Documentation changes, JSDoc, comments, changelog
-   `perf` - A code change that improves performance
-   `style` - Changes that do not affect the meaning of the code (white-space, formatting)
-   `refactor` - A code change that neither fixes a bug nor adds a feature. Refactor and cleanup of the
    source code that retains original functionality.
-   `test` - Adding new tests or correcting existing tests
-   `chore` - Change of code that do not fit anything described above. Changing of `.gitignore`, configuration of linter, etc.
-   `config` - Code change adjusting environment or tooling configuration.
-   `trivial` - Simple, low-risk code change, not bringing a new functionality. This type of change does not have to have JIRA footer.

#### Scope

The scope should be the name of the affected package (e.g. `sdk-backend-spi`, `sdk-model`, `sdk-ui`, `catalog-export`, etc).
You can omit scope for changes that are done across all packages (e.g. style: add missing semicolons).

#### Description

A short description of the change. The whole line should be
preferably 50 characters long or less, and no more than 72 characters. It should be entirely in lowercase
except of proper nouns, acronyms, and the words that refer to code, like function/variable names. There must
not be a dot (full stop) at the end of the header line.

#### Body

A detailed description of the commit, expanding on the short description in the title.
Lines must be wrapped at 72 characters.

#### Footer

The commit must include a footer.

The first (optional) line contains a JIRA ID reference in the format `JIRA: PROJECT-TICKET_ID`. For changes that do not require a JIRA ticket (e.g., typo fixes), use `JIRA: TRIVIAL` in the footer or omit this line entirely.

The second line specifies the potential risk introduced by the commit in the format `risk: [nonprod|low|high]`, e.g., `risk: low`.

#### Breaking changes

When you are introducing a breaking change, you should suffix the type or scope with `!` and preferably include `BREAKING CHANGE: <description>` in the commit body.

#### Revert

If the commit reverts a previous commit, it should begin with revert: ,followed by the header of the reverted commit. In the body it should say: This reverts commit \<hash\>., where the hash is the SHA of the commit being reverted.

---

**Hint**:
Usually, when you have trouble to pick a correct change type or describe changes in one line, the changes should have been structured in
multiple commits instead.

See [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for more examples
and complete description how commit message can be structured.

---

### What should the pull requests look like?

The pull request title should give a brief description of the changes introduced by the included commits.
It is no longer required to have it in any specific format as it is no longer parsed by any tooling.

> Note: It is OK to leave the pull request name same as the commit name in the case of a single commit.

Examples:

```
Support for drill to custom url
```

```
Update localization strings
```

```
build(lint): enable effect exhausting dependencies rule
```

In the pull request body, more detailed information can be provided about the changes. Try to explain the
changes happening in the PR (for single commit PR this will be pre-filled from your well described commit
already).

All the communication about the PR should happen in the PR via comments so that the process is
transparent and traceable.

### How do I tell if my Pull Request needs approval by a Code Owner?

If your Pull Request meets **any** of the following points, please ask some [Code Owner](../.github/CODEOWNERS) for review before merging:

-   introduces a breaking change
-   adds a new package
-   adds a new feature
-   adds a new dependency to any package published to NPM or upgrades it to a new major
-   changes the architecture in a non-trivial way
-   changes the implementation/behavior of any public functionality in a non-trivial way
-   changes CI scripts
-   changes package.json scripts

If your PR does not meet any of the aforementioned criteria, it can be merged by anyone with the necessary rights.

### How do I describe my changes for the CHANGELOG?

Run `rush change` and follow the instructions. Run this after any significant block of work (one or more commits) that you want to mention in the changelog. Think of this as a condensed commit message. You should probably run this after you have your PR ready for review and you have squashed your commits. Run the `rush change` and amend your final commit with the results. This will create files in `common/changes`. Commit these files, they will be used during release to generate CHANGELOG automatically.

As for how to write the changes, please refer to the [Rush recommendations](https://rushjs.io/pages/best_practices/change_logs/).
Moreover, if your changes are only in one package, please prefix the message with the name of the package like:

> sdk-ui-pivot: Add automatic column resizing

There will probably be a check step in the future that will make sure you ran the `rush change` command.

### How do I publish new version of packages?

For detailed description of the release process, please see [Release process](./releases.md).

### Where do I put my contributions?

Please go ahead and familiarize yourself with the GoodData.UI SDK architecture, layering and packaging design
which are all documented in our [Developer's Guide](./sdk-dev.md).

If you are still in doubt, ask.

### How do I create a new package?

Before proceeding, first ask yourself:

-   Why does the contribution not fit into an existing package? (see [Developer's Guide](./sdk-dev.md))
-   Which of the existing packages is closest fit for the contribution? Why does the contribution not fit in there? (see [Developer's Guide](./sdk-dev.md))

Once you have answers to these questions and still feel a new package is needed, get in touch for approval before
proceeding.

After that, we have a couple of skeleton projects to bootstrap development of new SDK packages. See [skel](skel) directory for
more information. Bear in mind the naming conventions described in the developer's guide.

### How do I test the changes in my own app?

There might be situations when you want to quickly test changes made in the SDK packages in your own app. There are two ways you can do it: using links or using `rsync`.

#### Using links

Let's try `sdk-ui` as an example (this guide is applicable to other packages – `sdk-model`, `sdk-backend-spi`, etc. as well). Use the following steps (we assume your app uses `yarn` as a dependency manager, you should be able to replace `yarn` by `pnpm` or `npm` depending on your app's setup and achieve the same results):

1.  Run `yarn link` in the `sdk-ui` folder.
2.  Run `yarn link "@gooddata/sdk-ui"` in your app root folder.

You only have to do the linking once. After you linked the package, you can run the compilation:

1.  Run `rushx dev` in the `sdk-ui` folder. This will start the compilation in watch mode and will rebuild `sdk-ui` on every change
2.  Run your app (you can use watch mode if applicable). You will see the up-to-date version of `sdk-ui` in your app and it will refresh as long as `pnpm run dev` is running.

#### Using `rsync`

Alternatively, if you want to avoid the potential problems with links, you can use the [`rsync`](https://en.wikipedia.org/wiki/Rsync) utility to copy the dist files of your version of the SDK packages to your app's `node_modules`. For example:

```bash
cd gooddata-ui-sdk
rush build
rsync -rptgD --no-links --include="/*/esm/*" ./libs/ ~/your-app/node_modules/@gooddata/
```

This will make sure that the SDK8 files in your app are from your local SDK8 version. To revert the changes, run `yarn install --force` or equivalent in your app.

> Hint: it is better to run the first `rsync` before starting your application, as the first run copies a lot of files and might make your app dev-server recompile multiple times unnecessarily. So the typical flow would be
>
> 1. run `rsync` as described above
> 2. after it finishes, run your app's dev server
> 3. change the SDK code and run `rush build -t [the package you make changes in]` and then run `rsync` without stopping your app

> Caveat: there is one problem with the `rsync` method on OS X when using case-insensitive but case-preserving file system -
> which seems to be the default. If you rename files and change just the character case then the rsync
> will not create new files with the updated casing in the target node_modules; it will update all the file contents but
> not change the case. A webpack build of the target application may then fail with `Module not found: Error: [CaseSensitivePathsPlugin]`
> because imports are for the new file name while the node_modules contains the old file names.

#### Using `applink` tool

Applink can make your life easier by watching for source code changes, automatically rebuilding the impacted packages and syncing
their artifacts into the target application's `node_modules` similar to what you would be doing manually with `rsync`.

To learn more about it check out the [tools/applink/README.md](../tools/applink/README.md).

## CI jobs and gating

Every pull-request can be merged by adding `merge` label. This triggers test scripts and once they pass, the pull-request is automatically merged. All related scripts run in docker, see `./common/scripts/ci/` for individual scripts being run on jenkins slaves.

You can run all checks which are executed in CI pipelines locally:

-   `rush rebuild`
-   `rush validate-ci`
-   `rush test-ci`
-   `cd libs/sdk-ui-tests; npm run backstop-test`

> Note: the pipelines WILL NOT run automatically for contributors outside of the GoodData organization. Please ping maintainers
> to trigger the pipeline execution.

## Troubleshooting

### `rush build` gives me error TS2307: Cannot find module '@gooddata/sdk-backend-spi'.

This might be caused by corrupted symlinks. Try running `rush link --force` to recreate them. After that, everything should work fine.

### `rush install` gives me "Error: Cannot find module '~/.rush/node-v10.16.3/rush-5.14.0/node_modules/@microsoft/rush-lib/lib/index'"

Try to run the following sequence of commands `npm un -g @microsoft/rush pnpm && rm -rf ~/.rush && npm i -g @microsoft/rush pnpm` to fix the issue.

### Conflict in pnpm-lock.yaml.

Run `rush update --recheck` and it should fix conflicts.
