# @gooddata/create-pluggable-module

Scaffolder for GoodData pluggable applications. Generates a `module/` (the federated app) and `harness/` (a thin host for running it standalone) under your repo's `modules/` directory, with all the wiring required to build, run, and federate the result.

## Usage

```sh
npm init @gooddata/pluggable-module
```

`npm init` resolves this package and runs its CLI. You'll be prompted for:

- **App name** — must start with `gdc-` (e.g. `gdc-revenue-tracker`)
- **Title** — the en-US display name shown in the host menu
- **Scope** — `workspace` (per-workspace app) or `organization` (org-wide app)
- **Destination path** _(optional)_ — defaults to `./modules/<app-name>/`

The scaffolder detects your package manager from the repo's lockfile (`npm`, `yarn`, `pnpm`) and runs `install` once the files are in place. If a `rush.json` is found, it also registers the new packages in it so `rush update` picks them up.

## What you get

```
modules/<app-name>/
├── module/      # The federated pluggable app — Module Federation remote, built with Vite.
└── harness/     # Standalone host that imports the module directly for fast local dev.
```

Each side ships its own `package.json`, `tsconfig.json`, `vite.config.ts`, eslint config, and starter source files. SDK dependencies are stamped at the matching `@gooddata/sdk-*` release version (see _Version coupling_ below).

Once scaffolded:

```sh
cd modules/<app-name>/harness
cp .env.template .env   # then fill in TIGER_API_TOKEN
npm run dev             # fast local dev loop — harness imports module source directly
```

To run the module as a federation remote against the harness (the production-shape dev loop):

```sh
cd modules/<app-name>/module
npm run dev             # serves remoteEntry.js at https://localhost:<modulePort>/
```

## Version coupling

This package ships on the same release train as the rest of the GoodData SDK (`versionPolicyName: "sdk"`). Scaffolded `module/package.json` and `harness/package.json` get their `@gooddata/sdk-*` deps stamped with this scaffolder's version, so the templates always align with the SDK release they were generated against. Upgrading a scaffolded app means bumping all `@gooddata/sdk-*` deps in lockstep.

## Programmatic API

The CLI is a thin wrapper over an exported engine. Consumers building their own scaffolders can import the engine directly:

```ts
import { runProfile, type IScaffoldProfile } from "@gooddata/create-pluggable-module";

await runProfile(myCustomProfile);
```

See `src/types.ts` for the `IScaffoldProfile` contract.
