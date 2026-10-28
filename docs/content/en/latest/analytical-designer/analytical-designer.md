---
title: AnalyticalDesigner component
description: Props, configuration, startup data, and limits of the AnalyticalDesigner component.
diataxis_type: reference
type: docs
weight: 1
api_symbols:
  - "@gooddata/sdk-ui-analytical-designer:AnalyticalDesigner"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerProps"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerConfig"
source_files:
  - src/embedding/AnalyticalDesigner.tsx
  - src/embedding/analyticalDesignerTypes.ts
  - src/embedding/slots.tsx
related_pages:
  - /docs/analytical-designer/embed-analytical-designer
  - /docs/analytical-designer/handle-analytical-designer-events
  - /docs/analytical-designer/customize-analytical-designer
  - /docs/dashboard-plugins/dashboard
section: Analytical Designer
category: Analytical Designer
ai_generated_body: true
---

`AnalyticalDesigner` renders the Analytical Designer editor and opens a saved visualization in it, or an empty editor for a new one. It fills its container, so give the container a height.

{{% alert color="warning" title="Alpha API" %}}
`AnalyticalDesigner` and all its types are `@alpha`: their shape can change outside of the usual SemVer guarantees. See [API maturity](../../integrations/platform/api-maturity/) before you depend on it.
{{% /alert %}}

## Basic usage

```tsx
import { AnalyticalDesigner } from "@gooddata/sdk-ui-analytical-designer";
import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { backend } from "./backend.js";

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<workspace-id>">
                <div style={{ height: "100vh" }}>
                    <AnalyticalDesigner insight="<visualization-id>" />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

The SDK stylesheets that Analytical Designer needs go before `main.css`. [Embed Analytical Designer](../embed-analytical-designer/) lists them.

## Backend and workspace

`AnalyticalDesigner` takes the `backend` and `workspace` props, or reads them from the `BackendProvider` and `WorkspaceProvider` above it. It runs on that backend instance, so your authentication and your cache apply.

Both values are read when the component mounts. To switch the backend or the workspace, remount the component with a new `key`.

When the backend caches, pass `cacheReset`. Analytical Designer calls `resetAll` when the user refreshes the catalog or edits a metric, and `resetCatalogs` before it loads the attribute hierarchies. The `CacheControl` of `withCaching` from `@gooddata/sdk-backend-base` fits the shape.

## Visualization to open

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

The `insight` prop takes an identifier, an `ObjRef`, or an `IInsight`. Leave it out to open an empty editor for a new visualization. A URI reference is resolved to an identifier before Analytical Designer opens it.

Two flows of `config` open a visualization in another way:

| Config | Flow |
| --- | --- |
| `sourceDashboard` | Edit from a dashboard. Its presence, not its value, starts the flow: the header offers going back to the dashboard. An empty string means the dashboard is not saved yet. |
| `sourceInsight` | Explore. Analytical Designer opens the visualization as an unsaved copy, and saving creates a new visualization. |

A new value of `insight`, `config.sourceDashboard`, or `config.sourceInsight` navigates Analytical Designer.

## Startup data

Before the editor mounts, `AnalyticalDesigner` loads the current user, the organization, the workspace settings, the color palette, the theme, and the user's permissions in the workspace. It shows the `Loading` slot meanwhile, and the `Error` slot and `onError` when the load fails.

Every value you already have skips its request:

| Value | Prop |
| --- | --- |
| Settings and feature flags | `config.settings` |
| Current user | `config.user` |
| Organization | `config.organization.id`, with `title` |
| Color palette | `config.colorPalette` |
| Theme | `theme`, or `disableThemeLoading` to use none |
| Permissions | `permissions` |

When you pass all of them, Analytical Designer starts without a request of its own.

## Configuration

`config` takes an `IAnalyticalDesignerConfig`. Its values fall into two groups:

- **Read at mount**: `locale`, `formatLocale`, `settings`, `user`, `organization`, `colorPalette`, `mapboxToken`, `agGridToken`, `whiteLabeling`, `isReadOnly`, and `telemetryCallbacks`. To change them, remount the component.
- **Followed**: `sourceDashboard`, `sourceInsight`, `hiddenActions`, `displayedActions`, `includeObjectsWithTags`, `excludeObjectsWithTags`, `separators`, `asOfDate`, `isEmbedded`, and `allowDashboardLinks`. A new value navigates Analytical Designer.

| Config | What it does |
| --- | --- |
| `locale` | Language of the user interface. The default is `en-US`. |
| `formatLocale`, `separators` | How numbers and dates are formatted. The defaults come from the settings. |
| `isReadOnly` | Hides the actions that change the visualization: save, save as, and create new. |
| `hiddenActions` | Header actions to hide: `"open"`, `"clear"`, `"export"`, `"save"`, `"saveAs"`, and `"openInAnalyticalDesigner"`. |
| `displayedActions` | Header actions to show that are hidden by default: `"cancel"`. |
| `includeObjectsWithTags`, `excludeObjectsWithTags` | Show only the catalog items with one of the tags, or hide the ones with one of the tags. |
| `asOfDate` | Date that relative date filters are computed from, in the `YYYY-MM-DD` format. |
| `allowDashboardLinks` | Whether the drill-to-dashboard configuration can link dashboards. |
| `isEmbedded` | Marks Analytical Designer as opened from a dashboard. |
| `mapboxToken`, `agGridToken` | Tokens for the geo charts and the pivot table. The defaults come from the settings. |
| `whiteLabeling` | Logo URL and branding of the user interface. |
| `telemetryCallbacks` | Forwards the Analytical Designer telemetry to your pipeline. The default tracks nothing. |

## Theme

`theme` replaces the workspace theme, `disableThemeLoading` skips loading it, and `themeModifier` changes the theme before Analytical Designer applies it. See [Customize Analytical Designer](../customize-analytical-designer/).

## Limits

- **One instance per page.** Analytical Designer keeps its state in one store per page, so mounting a second `AnalyticalDesigner` while one is mounted throws an error. Unmount the first one before you mount another.
- **Overlays.** Dialogs and menus open in `document.body`. There is no portal target prop.
- **Slots.** Only the `Loading` and `Error` regions can be replaced.
- **Styles.** Importing the package loads no stylesheet. Import the stylesheets yourself.

## Example

```tsx
import { useRef } from "react";

import {
    AnalyticalDesigner,
    type IAnalyticalDesignerApi,
} from "@gooddata/sdk-ui-analytical-designer";
import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";

import { backend, cacheReset } from "./backend.js";

export function VisualizationEditor({ onClose }: { onClose: () => void }) {
    const apiRef = useRef<IAnalyticalDesignerApi>(null);

    return (
        <div style={{ height: "100vh" }}>
            <button onClick={() => apiRef.current?.requestCancellation()}>Close</button>
            <AnalyticalDesigner
                backend={backend}
                workspace="<workspace-id>"
                insight="<visualization-id>"
                cacheReset={cacheReset}
                apiRef={apiRef}
                config={{
                    locale: "en-US",
                    hiddenActions: ["open", "openInAnalyticalDesigner"],
                    excludeObjectsWithTags: ["internal"],
                }}
                onEvent={(event) => {
                    switch (event.type) {
                        case "visualizationSaved":
                            console.log("saved", event.data.insight);
                            break;
                        case "insightEditingCancelled":
                            onClose();
                            break;
                    }
                }}
                onError={(error) => console.error("Analytical Designer cannot start", error)}
            />
        </div>
    );
}
```

## Props

{{% props %}}
