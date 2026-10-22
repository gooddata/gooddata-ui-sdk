---
title: ESM-only distribution
linkTitle: "ESM only"
description: The entry points GoodData.UI's ESM-only packages expose, the bundler, TypeScript, Node, and test runner requirements, and fixes for the common CommonJS errors.
category: Integrations / Platform
diataxis_type: reference
related_pages:
  - /docs/integrations/platform/architecture-overview
  - /docs/integrations/platform/compatibility
  - /docs/integrations/platform/supported-frameworks
  - /docs/getting-started/installation
type: docs
weight: 102
section: Integrations
subsection: Platform
---

Every `@gooddata` runtime and CLI package is published as ES modules (ESM) only. Each package declares `"type": "module"`, ships its TypeScript declarations alongside the ESM build, and exposes its entry points through the `exports` field. There is no CommonJS build and no UMD build.

This applies to the whole SDK: the runtime packages, the CLI tools (`@gooddata/app-toolkit`, `@gooddata/catalog-export`, `@gooddata/plugin-toolkit`), and the project templates they scaffold.

## Package entry points

A package's `exports` map is its supported surface. Most packages expose these subpaths:

| Subpath | Contents |
| :--- | :--- |
| `.` | The package's public API — `import { BarChart } from "@gooddata/sdk-ui-charts";` |
| `./internal` | Internal exports, on the packages that expose them. They may change or disappear at any time — see [API maturity](../api-maturity/) |
| `./styles/css/*` and `./styles/scss/*` | Stylesheets, on the packages that ship compiled CSS — `import "@gooddata/sdk-ui-charts/styles/css/main.css";` |

Roughly half the packages expose only `.`, and several add subpaths of their own: `@gooddata/sdk-ui-pivot` exposes `./next`, `@gooddata/sdk-ui-gen-ai` exposes `./context`, `@gooddata/sdk-ui-theme-provider` exposes `./node`, `@gooddata/api-client-tiger` exposes one `./endpoints/` entry per API area, and `@gooddata/sdk-ui-kit` uses `./styles/*` rather than `./styles/css/*`. The package's own `exports` map is the authoritative list.

Paths the map does not declare do not resolve, even when the file ships inside the package tarball:

```ts
// Won't resolve — not declared in the exports map
import { BarChart } from "@gooddata/sdk-ui-charts/esm/charts/barChart/BarChart.js";
```

## Toolchain requirements

| Piece | Requirement |
| :--- | :--- |
| Bundler | Any bundler that resolves ES modules and the `exports` field: Vite, webpack 5, Rollup, esbuild, Parcel 2, or Next.js |
| TypeScript | >= 5.8.3, with `module: NodeNext` and `moduleResolution: NodeNext` — or `moduleResolution: Bundler` paired with `module: ESNext` or `module: Preserve`. The legacy `node` (`node10`) resolution can't read `exports` and reports the package as missing |
| Node.js | ^24.12.0 LTS, with `"type": "module"` in your `package.json` — or `.mjs` file extensions |
| Test runner | Vitest runs ES modules natively. Jest needs its ESM mode configured |

The project that `@gooddata/app-toolkit` scaffolds is already set up this way. Its `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022", "DOM"],
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "jsx": "react-jsx"
    }
}
```

## CommonJS interoperability

A CommonJS module loads the SDK through a dynamic `import()`, which returns a promise for the module namespace:

```ts
async function loadBackend() {
    const { tigerFactory } = await import("@gooddata/sdk-backend-tiger");

    return tigerFactory();
}
```

{{% alert color="warning" title="Don't rely on require()" %}}
Node.js 22.12 and later can `require()` some ES modules, but bundler-emitted CommonJS and transform-based test runners still can't. `import` and dynamic `import()` are the only reliable ways to load these packages.
{{% /alert %}}

Config files that have to stay CommonJS keep the `.cjs` extension. The scaffolded app has none: its `vite.config.ts` is an ES module like the rest of the project — see the [project structure](../../../getting-started/quickstart/#look-around-the-project) in the Quick start guide.

## Troubleshooting

| Error | Cause | Fix |
| :--- | :--- | :--- |
| `Error [ERR_REQUIRE_ESM]: require() of ES Module …` | A CommonJS module called `require()` on an ESM package | Use `import`, or `await import()` from CommonJS |
| `Cannot find module '@gooddata/sdk-ui' or its corresponding type declarations` | TypeScript `moduleResolution` is `node` or `node10`, which ignores the `exports` field | Set `module` and `moduleResolution` to `NodeNext` |
| `Cannot use import statement outside a module` | Jest, or another runner, is transforming ES modules as CommonJS | Configure Jest for ESM, or switch to Vitest |
| webpack `Module not found: Error: Can't resolve './x'` | ES modules require fully specified relative imports | Keep the `.js` extension on relative imports, or set `resolve.extensionAlias` in your webpack config |

## Web Components

`@gooddata/sdk-ui-web-components` is not published to npm. It loads from your GoodData server as a `<script type="module">` bundle, so it's ES modules too — there is no CommonJS variant and no bundler configuration to adjust on your side. See the [Web Components overview](../../web-components/web-components-overview/).
