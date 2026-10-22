---
title: Customize dashboard export
category: Dashboard & plugins
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-dashboard:exportDashboardToPdf"
  - "@gooddata/sdk-ui-dashboard:exportDashboardToExcel"
  - "@gooddata/sdk-ui-dashboard:exportDashboardToPdfPresentation"
  - "@gooddata/sdk-ui-dashboard:exportDashboardToPptPresentation"
  - "@gooddata/sdk-ui-dashboard:useDashboardAsyncRender"
source_files:
  - src/model/commands/dashboard.ts
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/dashboard-plugins/customize-widgets
  - /docs/integrations/interactivity/on-export-ready
  - /docs/data-layer/use-data-export
  - /docs/dashboard-plugins/dashboard-plugins-api
description: Trigger a whole-dashboard export to PDF, PPTX, or tabular format, make custom widgets export-ready, and customize how a dashboard decomposes into export slides.
type: docs
weight: 36
section: Dashboard & plugins
---

{{% alert color="warning" title="API maturity" %}}
The commands on this page are `@beta`. The slides export layout customizer (`customizeExportLayout` and its transformer helpers) is `@alpha` and may still change. See [API maturity](../../integrations/platform/api-maturity/).
{{% /alert %}}

## Where exports render

A whole-dashboard export does not capture what is on the user's screen. A GoodData service renders the
dashboard again in a headless browser with `config.isExport` set, waits for every widget to report that it
has rendered, and captures the result. The dashboard loads its linked plugins there as it does for a user,
so your plugin's customizations shape the export, and your plugin code has to work without a user and with
the plugin files reachable from GoodData's infrastructure. See
[Exports and scheduled deliveries](../dashboard-plugins/#exports-and-scheduled-deliveries) for what that
means for a plugin. The rest of this page covers the export APIs themselves.

## Which export mechanism do I want?

GoodData.UI has several export mechanisms with overlapping names. Pick by scope:

| You want to... | Use |
|---|---|
| Export a raw execution you built yourself | [useDataExport](../../data-layer/use-data-export/) |
| Export a visualization component you render yourself (for example a standalone `InsightView`) | [onExportReady](../../integrations/interactivity/on-export-ready/) |
| Let a plugin's custom visualization renderer participate in the Dashboard's own per-widget Export popup | `pushData`, see [Dashboard plugin API](../dashboard-plugins-api/#enable-csv-and-xlsx-export-for-custom-visualization-renderers) |
| Trigger a whole-dashboard export (PDF, PPTX, or tabular) from a mounted `Dashboard` | This page |

## Trigger a whole-dashboard export

Dispatch one of the export commands with the `useDispatchDashboardCommand` hook (see [Dashboard component](../dashboard/#commands)):

```tsx
import { useDispatchDashboardCommand, exportDashboardToPdf } from "@gooddata/sdk-ui-dashboard";

function ExportToPdfButton() {
    const exportToPdf = useDispatchDashboardCommand(exportDashboardToPdf);

    return <button onClick={() => exportToPdf()}>Export to PDF</button>;
}
```

| Command | Produces | Notes |
|---|---|---|
| `exportDashboardToPdf(payload?, correlationId?)` | A snapshot PDF of the dashboard as currently laid out | `payload.exportMetadata` attaches arbitrary key-value metadata to the export |
| `exportDashboardToPdfPresentation(payload?, correlationId?)` | A slides-based PDF, one slide per decomposed section | `payload.filters` overrides the filters used for the export; `payload.options` is `IDashboardExportPresentationOptions` from `@gooddata/sdk-backend-spi`; `payload.exportMetadata` works as for `exportDashboardToPdf` |
| `exportDashboardToPptPresentation(payload?, correlationId?)` | The same slides decomposition as a PPTX file | Same payload shape as the PDF presentation command |
| `exportDashboardToExcel(mergeHeaders, exportInfo, widgetIds?, fileName?, format?, pdfConfiguration?, correlationId?)` | A tabular export of the dashboard's widgets | Despite the name, `format` can also be `"PDF"` — a tabular-style PDF rendering, not the visual snapshot `exportDashboardToPdf` produces. Pass `widgetIds` to export a subset of widgets. |

`exportDashboardToExcel`'s `pdfConfiguration`, used when `format` is `"PDF"`, is a `PdfConfiguration`: `pageSize` (`"A3" | "A4" | "LETTER"`), `pageOrientation` (`"PORTRAIT" | "LANDSCAPE"`), and `showInfoPage`.

These commands export the dashboard mounted in the current `Dashboard` component, using its live state.

## Prepare a custom widget for export

If a custom widget loads data asynchronously — through [the hooks for calculating custom widget data](../dashboard-plugins-api/#calculate-data-for-a-custom-widget) or your own HTTP requests — tell the dashboard about it with `useDashboardAsyncRender`, so export waits for the widget instead of capturing it mid-load. By default, the dashboard waits up to 20 minutes for outstanding renders, then exports anyway.

```tsx
import { LoadingComponent, ErrorComponent } from "@gooddata/sdk-ui";
import { type IDashboardInsightProps, useDashboardAsyncRender, useInsightWidgetDataView } from "@gooddata/sdk-ui-dashboard";

function MyCustomInsight(props: IDashboardInsightProps) {
    // The identifier must be unique for each rendered instance of this component.
    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender("myCustomWidget");

    const { result, status } = useInsightWidgetDataView({
        insightWidget: props.widget,
        onLoading: () => onRequestAsyncRender(),
        onSuccess: () => onResolveAsyncRender(),
        onError: () => onResolveAsyncRender(),
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent />;
    }

    return <pre>{JSON.stringify(result!.data().series().toArray(), null, 4)}</pre>;
}
```

This matters beyond export too: it's also what makes the `GDC.DASH/EVT.RENDER.RESOLVED` event fire at the right time, once every widget has actually finished rendering.

### Detect export mode

The export service renders the whole dashboard afresh; it does not screenshot what's currently on screen. If a custom widget has interactive state, that state will not appear in the export unless you branch on the export mode and render accordingly:

```tsx
import { InsightView } from "@gooddata/sdk-ui-ext";
import { type IDashboardInsightProps, useDashboardAsyncRender, useDashboardSelector, selectIsExport } from "@gooddata/sdk-ui-dashboard";

function MyCustomInsight(props: IDashboardInsightProps) {
    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender("myCustomWidget");
    const isExportSnapshotMode = useDashboardSelector(selectIsExport);

    return (
        <InsightView
            insight="<your-visualization-id>"
            onLoadingChanged={({ isLoading }) => (isLoading ? onRequestAsyncRender() : onResolveAsyncRender())}
            onError={() => onResolveAsyncRender()}
            config={{
                // Without this, some charts render incorrectly during export.
                isExportMode: isExportSnapshotMode,
            }}
        />
    );
}
```

`selectIsExport` reflects `config.isExport`, which the `Dashboard` component expects to be set when the dashboard is rendered for an export; this is the mode the exporter uses for `exportDashboardToPdf`'s snapshot.

## Customize the slides export layout

The slides export decomposes the dashboard's layout into one or more slides. Register a transformer through `customize.layout().customizeExportLayout()` to change that decomposition:

```tsx
import { compact } from "lodash-es";
import { DashboardPluginV1, type DashboardContext, type IDashboardCustomizer } from "@gooddata/sdk-ui-dashboard";

export class Plugin extends DashboardPluginV1 {
    public register(_ctx: DashboardContext, customize: IDashboardCustomizer): void {
        customize.layout().customizeExportLayout((_layout, customizer) => {
            customizer.addTransformer((section, { defaultSection }) => {
                return compact([defaultSection(section)].flat());
            });
        });
    }
}
```

If you register no transformer, the default decomposition runs as-is. A registered transformer runs for every section and returns the section(s) that should end up on slides — call `defaultSection(section)` inside it to keep the default behavior for a section and layer your own logic around it.

Building blocks available to a transformer:

- `defaultItems()` / `defaultSection()` — the transformer used when nothing overrides it, for items and sections respectively.
- `breakUpSlide()` — extracts a slide from a section's title and description (only when the section has one or the other).
- `containerSlide()` — turns a dashboard container item into a structured slide; a visualization switcher inside it is decomposed into a flat list of visualizations.
- `containerSwitcherSlide()` — like `containerSlide()`, but a visualization switcher inside the container is spread across multiple whole slides, one visualization from the switcher per slide, with the container's other visualizations repeated on each.
- `itemsSlide()` — iterates every item in a section, calling your transform function on each.
- `switcherSlide()` — creates one slide per visualization inside a visualization switcher widget.
- `widgetSlide()` — turns one layout item into a single-widget slide.
- `containsVisualisationSwitcher()` — tests whether a section contains a visualization switcher.
