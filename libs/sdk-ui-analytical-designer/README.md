# @gooddata/sdk-ui-analytical-designer

**Analytical Designer** (AD) as a React component, `AnalyticalDesigner`, and the runtime behind the
AD pluggable module and the in-process AD editor that Dashboards and Publisher open for an insight.

It is published on every gdc-ui release as a private package in the `@gooddata` npm org, with the
same version as the GoodData.UI SDK (version policy `gdc-ui-private`). The public API is `@alpha`.

## Entry points

| Import                                          | Content                                                                                                                                                | Used by                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `@gooddata/sdk-ui-analytical-designer`          | The public API: `AnalyticalDesigner` and its types, tracked in `api/gdc-analytical-designer.api.md`                                                    | Applications that embed AD                                                   |
| `@gooddata/sdk-ui-analytical-designer/internal` | App wiring (`Root`, the redux store and sagas, bootstrap and mode actions), the platform-context mappers and `AnalyticalDesigner` with the token props | The AD pluggable module and the Dashboards insight overlay; not a public API |
| `@gooddata/sdk-ui-analytical-designer/styles/*` | AD's stylesheet, `styles/css/main.css`, its SCSS source and the images it references                                                                   | Every host, see Styles                                                       |

## Quick start

This setup embeds AD in a Vite application.

### Dependencies

The package is private: the npm user needs read access to the `@gooddata` npm org. The package has
the version of the GoodData.UI SDK it was built with. Install it at the SDK version the host uses,
with the `@gooddata/sdk-*` packages at the same version (`<sdk-version>` below), and with the
React peers:

```json
{
    "dependencies": {
        "@gooddata/sdk-ui-analytical-designer": "<sdk-version>",
        "@gooddata/sdk-backend-base": "<sdk-version>",
        "@gooddata/sdk-backend-spi": "<sdk-version>",
        "@gooddata/sdk-backend-tiger": "<sdk-version>",
        "@gooddata/sdk-ui": "<sdk-version>",
        "react": "19.1.1",
        "react-dom": "19.1.1",
        "react-intl": "10.1.25"
    }
}
```

With the same version, the host and AD share one copy of each SDK package, so they share its React
contexts and the bundle contains one SDK.

### Backend

AD runs on the host's backend. When the backend caches, give AD the cache resets, so the catalog
Refresh button and a metric edit load fresh data:

```ts
// backend.ts
import { type CacheControl, RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { ContextDeferredAuthProvider, tigerFactory } from "@gooddata/sdk-backend-tiger";

let cacheControl: CacheControl | undefined;

export const backend = withCaching(tigerFactory().withAuthentication(new ContextDeferredAuthProvider()), {
    ...RecommendedCachingConfiguration,
    onCacheReady: (control) => {
        cacheControl = control;
    },
});

export const cacheReset = {
    resetAll: () => cacheControl?.resetAll(),
    resetCatalogs: () => cacheControl?.resetCatalogs(),
};
```

### Component

```tsx
// App.tsx
import {
    AnalyticalDesigner,
    type AnalyticalDesignerSlotComponent,
    type IAnalyticalDesignerErrorProps,
    type IAnalyticalDesignerLoadingProps,
    type IAnalyticalDesignerSlots,
} from "@gooddata/sdk-ui-analytical-designer";
// The SDK stylesheets AD needs come first (see Styles), then AD's own stylesheet.
import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { backend, cacheReset } from "./backend.js";

// A slot gets the default region and the props the default would get: wrap it or replace it.
const HostLoading: AnalyticalDesignerSlotComponent<IAnalyticalDesignerLoadingProps> = ({
    Default,
    defaultProps,
}) => (
    <div className="my-loading">
        <p>Starting Analytical Designer…</p>
        <Default {...defaultProps} />
    </div>
);

const HostError: AnalyticalDesignerSlotComponent<IAnalyticalDesignerErrorProps> = ({ defaultProps }) => (
    <div className="my-error">
        {defaultProps.error instanceof Error ? defaultProps.error.message : "AD cannot start."}
    </div>
);

// Define the slots once, outside the component, so they keep their identity between renders.
const slots: IAnalyticalDesignerSlots = { Loading: HostLoading, Error: HostError };

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="workspace-id">
                {/* AD fills its container: give the container a height. */}
                <div style={{ height: "100vh" }}>
                    <AnalyticalDesigner
                        insight="insight-id"
                        config={{ locale: "en-US" }}
                        cacheReset={cacheReset}
                        slots={slots}
                        onEvent={(event) => console.log(event.type, event.data)}
                        onError={(error) => console.error("AD error", error)}
                    />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

Leave out `insight` to open a new insight. The AnalyticalDesigner component section below lists all props.

## Requirements for a consumer

- **React**: `react`, `react-dom` and `react-intl` are peer dependencies.
- **SDK versions**: the `@gooddata/sdk-*` dependencies are pinned to the SDK version the package was
  built with. AD mounts its own backend, workspace and theme providers, so it runs next to a host on
  another SDK version. Align the versions when host components and AD components have to share a
  React context from the SDK, and to avoid bundling two SDK copies.
- **Build-time defines**: `process.env` must be defined (`{}`). The MAQL parser of the metric editor
  (`antlr4ts`) loads the `assert` and `util` polyfills, which read it when they load. No other
  define is needed: AD does not read `global`. The
  build flags `DEBUG`, `TESTING`, `READONLY_MODE` and `TIGER_API_TOKEN` are optional: the code reads
  them behind `typeof` guards and falls back to production defaults, so define them only to change
  that behavior. `modules/gdc-analytical-designer/module/vite.config.ts` is the reference setup.
- **Workers**: no setup is needed in Vite or webpack. The metric editor
  (`@gooddata/sdk-ui-metric-component`) ships Monaco's editor worker bundled into one file. It starts
  the worker from that file when the bundler emitted it next to the page, and from a Blob of the same
  code otherwise, for example in the Vite dev server or when the editor loads from another origin. A
  content security policy must then allow `blob:` workers. A page that enforces Trusted Types must
  allow the `gdMetricEditorWorker` policy, or create it through
  `MonacoEnvironment.createTrustedTypesPolicy`. A host that sets its own `MonacoEnvironment`
  (`getWorker` or `getWorkerUrl`) before the editor loads keeps its own workers.

- **Import side effects**: importing an entry creates no router and no browser history. `Root`
  creates its router when it mounts: a `BrowserRouter` under the host's base path in the pluggable
  module, and none in hosted-component mode. AD's own modules load in Node without a
  DOM, but two dependencies use browser APIs when they load: `@gooddata/sdk-ui-metric-component`
  (through `monaco-editor`) and `jquery.browser`. `rushx validate-esm` imports both entries in
  Node, loads CSS and image imports as a bundler does, and replaces those two dependencies with
  stubs.

- **Styles**: importing the package loads no stylesheet, and no module of the package imports one.
  Import the SDK stylesheets AD needs and then AD's `main.css` once, where AD loads, in this order so
  AD's rules win over the SDK rules:

    ```ts
    import "@gooddata/sdk-ui-kit/styles/css/main.css";
    import "@gooddata/sdk-ui-pivot/styles/css/main.css";
    import "@gooddata/sdk-ui-geo/styles/css/main.css";
    import "@gooddata/sdk-ui-charts/styles/css/main.css";
    import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";
    import "@gooddata/sdk-ui-filters/styles/css/dateFilter.css";
    import "@gooddata/sdk-ui-filters/styles/css/rankingFilter.css";
    import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
    import "@gooddata/sdk-ui-ext/styles/css/main.css";
    import "@gooddata/sdk-ui-semantic-search/styles/css/internal.css";
    import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";
    ```

    Each stylesheet is a separate import, so a bundler loads it once when the host imports it too,
    and it comes from the SDK version the host installs. A host that already loads the SDK
    stylesheets imports only `main.css`.

    `main.css` has AD's rules, the sdk-ui-ext config-panel and dropdown-icon partials that no public
    SDK stylesheet ships, and sdk-ui-kit's editable-label styles from the buckets partial. It sets no
    page-level rules: headings, paragraphs and native form controls are styled only inside AD's root
    element and its error screen, with `:where(.app-root, .main-error)`, so they keep the specificity of
    an element selector. The page reset (`normalize.css`), the `html` and `body` baselines, links, and
    dialogs AD portals to `document.body` take the host's typography.

    The stylesheet is compiled from `styles/scss/main.scss` by the build, like every SDK package; the
    images it references live in `styles/images` and ship with the package. The pluggable-app dev
    servers in gdc-ui serve `styles/css/main.css` from that SCSS source
    (the `gooddataSdkSourcePlugin` from `@gooddata/toolchain-config/vite`), so style changes reload without a rebuild.
    Other hosts, such as the webpack Dashboards app, use the compiled file and need a lib rebuild.

- **One instance per page**: the redux store is a module-level singleton, so mounting a second
  `AnalyticalDesigner` while one is mounted throws an error.
- **Telemetry**: AD sends its tracking events to the host's telemetry callbacks, and tracks nothing
  when the host passes none. It ships no telemetry backend of its own. Its `appBootstrap` span goes
  through `@opentelemetry/api`, so it reaches a tracer provider the host registers globally.

## The AnalyticalDesigner component

```tsx
import { AnalyticalDesigner } from "@gooddata/sdk-ui-analytical-designer";
import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";

<BackendProvider backend={backend}>
    <WorkspaceProvider workspace="workspace-id">
        <AnalyticalDesigner
            insight="insight-id"
            config={{ locale: "en-US", hiddenActions: ["open"], isReadOnly: false }}
            cacheReset={cacheReset}
            onEvent={(event) => {
                switch (event.type) {
                    case "visualizationSaved":
                        console.log("saved", event.data.insight);
                        break;
                    case "metricsChanged":
                        console.log("metrics changed");
                        break;
                }
            }}
        />
    </WorkspaceProvider>
</BackendProvider>;
```

- **Backend and workspace**: the `backend` and `workspace` props, else the `BackendProvider` and
  `WorkspaceProvider` above. AD runs on the host's backend instance, so the host's authentication
  and cache apply.
- **Insight**: an identifier, a reference or the insight object; undefined opens a new insight. URI
  references are resolved to identifiers first. A new `insight`, `config.sourceDashboard` or
  `config.sourceInsight` navigates AD.
- **Loading**: before AD mounts, it loads the user, the organization and its entitlements, the
  workspace settings, color palette and theme, and the user's permissions in the workspace. A value
  the host already has skips its request: `config.settings`, `config.user`, `config.organization.id`
  (with `title`), `config.organization.entitlements`, `config.colorPalette`, `theme` and
  `permissions`. A host that passes all of them makes AD start without a request. The values that set
  up the runtime (`backend`, `workspace`, `permissions`, the theme props and `config` except the
  route values) are read at mount; the route values (actions, tags, separators, `asOfDate`,
  `isEmbedded`, `allowDashboardLinks`) follow the props.
- **Theme**: `theme` replaces the workspace theme, `disableThemeLoading` skips it, and
  `themeModifier` changes the theme AD applies.
- **Events**: `onEvent` gets every event AD emits as an `AnalyticalDesignerEvent`: `type`, `data`
  and the `contextId` of the command the event answers. Checking `type` narrows `data`;
  `IAnalyticalDesignerEventDataMap` lists the payload of each type. The types are the names of the
  `@gooddata/sdk-embedding` contract (`visualizationSaved`, `insightEditingCancelled`,
  `insightOpened`, `appCommandFailed`, `undoFinished`, ...), plus `metricsChanged`, when the user
  saves or deletes a metric, and `availableCommands`. The `drill` event carries the `IDrillEvent` of
  `@gooddata/sdk-ui`. `onError` fires when AD cannot start. A host that shares a caching backend
  with AD passes `cacheReset` (`resetAll`, `resetCatalogs`; the `CacheControl` of `withCaching`
  fits): AD calls it when the user
  refreshes the catalog or edits a metric, before it reloads the data.
- **Commands**: `apiRef` takes `clear`, `requestCancellation`, `setFilterContext` and
  `sendCommand`. Commands sent before AD mounts run once it does.
- **Slots**: `slots.Loading` and `slots.Error`, each a component that gets the `Default` region and
  its `defaultProps` (ADR-26-02). `Error` covers both a failed load and
  AD's own bootstrap errors.
- **Not yet**: the `Header` and `MetricEditor` slots and a portal target: AD's
  overlays open in `document.body`.

The `./internal` entry exports the same component with `auth`, `externalProviderId` and an
`apiRef` that also takes `setApiToken`, for GoodData apps that renew tokens through AD.

## Development

```bash
# Build to esm/
rushx build

# Run tests in watch mode, or once
rushx test
rushx test-once

# Lint, dependency rules, styles, formatting, locales and the state-architecture gate
rushx validate

# Import both entries in Node (needs a build)
rushx validate-esm

# Update the API report, api/gdc-analytical-designer.api.md (also part of the build)
rushx api-extractor
```
