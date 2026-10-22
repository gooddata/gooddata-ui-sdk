---
title: Customize widgets and visualizations
category: Dashboard & plugins
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-dashboard:IDashboardInsightCustomizer"
  - "@gooddata/sdk-ui-dashboard:IDashboardWidgetCustomizer"
  - "@gooddata/sdk-ui-dashboard:IDashboardCustomComponentProps"
related_pages:
  - /docs/dashboard-plugins/dashboard-plugins-api
  - /docs/dashboard-plugins/use-custom-widget-data-view
  - /docs/dashboard-plugins/dashboard
  - /docs/integrations/interactivity/drillable-items
  - /docs/dashboard-plugins/dashboard-events
type: docs
ai_generated_body: true
description: Choose which layer of a dashboard widget to replace (the widget, the visualization, or its body) and how drills flow through custom renderers.
weight: 35
section: Dashboard & plugins
---

The Dashboard component renders every widget through a small stack of replaceable React components. Pick the right layer and you keep the parts you don't want to rebuild: the title, the menu, the dashboard filters, exports, and drilling. This page maps the stack, names the plugin method and the `Dashboard` prop for each layer, and explains what a custom renderer has to do so that drilling keeps working. The individual methods are described in [Dashboard plugin API](../dashboard-plugins-api/#customization-api).

## How a widget is rendered

From the outside in:

1. **Layout.** `DefaultDashboardLayout` places the dashboard's sections and items on the 12-column grid. Each item holds one widget.
2. **Widget.** For every item, the layout asks the widget provider for a component and renders it with `IDashboardWidgetProps`. `DefaultDashboardWidget` picks a renderer by widget type: visualization, rich text, visualization switcher, or nested layout. It refuses custom widgets, which is why registering a custom widget type always includes registering its component.
3. **Visualization widget chrome.** The built-in visualization widget draws the frame: the headline with the title, the description, the **⋯** menu button and the menu it opens, and warnings such as a partial result.
4. **Visualization.** Inside the frame, the insight provider's component renders with `IDashboardInsightProps`. `DefaultDashboardInsight` resolves the dashboard filters that apply to the widget, works out what is drillable, shows the loading and error states, and then hands over to the body.
5. **Visualization body.** The body provider's component receives `IInsightBodyProps`: the visualization with the widget's filters already merged in, the drillable items, the chart config, the color palette, the locale, and callbacks. `DefaultInsightBody` is a thin wrapper around `InsightRenderer` from `@gooddata/sdk-ui-ext`.

Rich text widgets and visualization switcher widgets have their own providers at level 4 and no body layer.

## Pick the layer

| You want to | Replace | You keep |
| :-- | :-- | :-- |
| Draw a visualization with your own library, such as D3 or a table | the body | the title, the menu, exports, dashboard filters, drillable items |
| Change how a visualization loads, or which filters it honors | the visualization | the title and the menu |
| Add a frame, a badge, or a footer to visualizations | nothing, decorate the visualization | everything |
| Put other content on the dashboard: text, an image, a form, your own component | nothing, add a custom widget type | the layout and the filters |
| Change the **⋯** menu | the menu items, the menu, or its button | everything else |
| Intercept every widget, including rich text | the widget | the layout |

## Plugin API and Dashboard props

Each layer has a method on the plugin customizer and a prop on the `Dashboard` component. Use the plugin API when the customization ships as a plugin. Use the props when your own React app renders the Dashboard component and you don't ship a plugin. Both take the same provider function: it receives the object to render and returns a component, or `undefined` to fall back to the default. A decorator receives the next provider in the chain instead and wraps what it returns.

| Layer | Plugin API | Dashboard prop | Component props | Default component |
| :-- | :-- | :-- | :-- | :-- |
| Layout | `layout().withCustomProvider()`, `withCustomDecorator()`, `customizeFluidLayout()` | `DashboardLayoutComponentProvider` | `IDashboardLayoutProps` | `DefaultDashboardLayout` |
| Widget | `customWidgets().addCustomWidget()` | `WidgetComponentProvider` | `IDashboardWidgetProps` | `DefaultDashboardWidget` |
| Visualization | `insightWidgets().withCustomProvider()`, `withTag()`, `withCustomDecorator()` | `InsightComponentProvider` | `IDashboardInsightProps` | `DefaultDashboardInsight` |
| Visualization body | `insightWidgets().withCustomInsightBodyProvider()` (alpha) | `InsightBodyComponentProvider` (alpha) | `IInsightBodyProps` | `DefaultInsightBody` |
| Menu button | — | `InsightMenuButtonComponentProvider` (alpha) | `IDashboardInsightMenuButtonProps` | `DefaultDashboardInsightMenuButton` |
| Menu | — | `InsightMenuComponentProvider` (alpha), `insightMenuItemsProvider` (alpha) | `IDashboardInsightMenuProps` | `DefaultDashboardInsightMenu` |
| Rich text widget | `richTextWidgets().withCustomProvider()`, `withCustomDecorator()` | `RichTextComponentProvider` | `IDashboardRichTextProps` | `DefaultDashboardRichText` |
| Visualization switcher | `visualizationSwitcherWidgets().withCustomSwitcherProvider()`, `withCustomToolbarProvider()`, and their decorators | `VisualizationSwitcherComponentProvider`, `VisualizationSwitcherToolbarComponentProvider` | `IDashboardVisualizationSwitcherProps` | `DefaultDashboardVisualizationSwitcher` |

The alpha entries can change between minor releases. See [API maturity](../../integrations/platform/api-maturity/).

## Draw a visualization yourself

Replacing the body is the least work when a built-in chart isn't what you need but everything around it is. Your component gets the visualization (`insight`) with the widget's dashboard filters merged in, so executing it is enough. Tag the visualizations in your workspace that should use the custom body, and register the body in the plugin:

```tsx
import { insightTags } from "@gooddata/sdk-model";
import { DashboardPluginV1, type DashboardContext, type IDashboardCustomizer } from "@gooddata/sdk-ui-dashboard";

import { BarsBody } from "./BarsBody.js";

export class Plugin extends DashboardPluginV1 {
    public register(_ctx: DashboardContext, customize: IDashboardCustomizer): void {
        customize
            .insightWidgets()
            .withCustomInsightBodyProvider((insight) =>
                insightTags(insight).includes("custom-bars") ? BarsBody : undefined,
            );
    }
}
```

The body renders the result as a list. It reports loading and errors through the callbacks it received, so the widget frame can react, and pushes the data view so that the **⋯** menu offers CSV and XLSX export of what you rendered:

```tsx
import { useEffect, useMemo } from "react";
import { useExecutionDataView } from "@gooddata/sdk-ui";
import type { IInsightBodyProps } from "@gooddata/sdk-ui-dashboard";

export function BarsBody(props: IInsightBodyProps) {
    const { insight, backend, workspace, onLoadingChanged, onError, pushData, LoadingComponent, ErrorComponent } =
        props;

    // The visualization already carries the dashboard filters that apply to this widget.
    const execution = useMemo(
        () => backend.workspace(workspace).execution().forInsight(insight),
        [backend, workspace, insight],
    );
    const { result, status, error } = useExecutionDataView({ execution }, [execution]);

    useEffect(() => {
        onLoadingChanged?.({ isLoading: status === "loading" });
    }, [status, onLoadingChanged]);

    useEffect(() => {
        if (error) {
            onError?.(error);
        }
    }, [error, onError]);

    useEffect(() => {
        if (result) {
            pushData?.({ dataView: result.dataView });
        }
    }, [result, pushData]);

    if (status === "error") {
        return <ErrorComponent message={error?.message ?? "Unknown error"} />;
    }
    if (status !== "success" || !result) {
        return <LoadingComponent />;
    }

    const slices = result.data().slices().toArray();
    return (
        <ol>
            {slices.map((slice) => (
                <li key={slice.id}>
                    {slice.sliceTitles().join(" / ")}: {slice.dataPoints()[0]?.formattedValue()}
                </li>
            ))}
        </ol>
    );
}
```

Without a plugin, pass the same function as the `InsightBodyComponentProvider` prop of the `Dashboard` component.

A custom body has to implement drilling itself. The built-in charts compare each rendered point with `drillableItems`, mark the matches as clickable, and call `onDrill` with an `IDrillEvent` when the user clicks one. In your own body, `drillableItems` arrive as header predicates and object references. Turn them into predicates with `convertDrillableItemsToPredicates` from `@gooddata/sdk-ui`, test each point's headers with `isSomeHeaderPredicateMatched`, and call `onDrill` with the clicked point's `intersection`. [Make visualizations drillable](../../integrations/interactivity/drillable-items/) describes the predicates, and [How drills flow](#how-drills-flow) below describes what the dashboard does with the event.

## Replace or decorate the whole visualization

When loading, filtering, or drilling itself should work differently, register a component for the visualization layer with `withCustomProvider()` or `withTag()`, or wrap the default with `withCustomDecorator()`. Your component receives `IDashboardInsightProps` with the `insight`, the `widget`, and the drill callbacks, and it is responsible for everything inside the frame, including loading and error states. [Customize rendering of visualizations](../dashboard-plugins-api/#customize-rendering-of-visualizations) walks through the three methods and shows a decorator.

The `insight` at this layer does not have the dashboard filters merged in. Resolve them with [useWidgetFilters](../use-widget-filters/) and pass them to the execution, or render an `InsightView` and let it do the work; see [Enable CSV and XLSX export for custom visualization renderers](../dashboard-plugins-api/#enable-csv-and-xlsx-export-for-custom-visualization-renderers) for the `pushData` detail that keeps the export menu working.

## Change the widget menu

The **⋯** menu is built from a list of items. To add, remove, or reorder them, pass `insightMenuItemsProvider` to the `Dashboard` component. The function receives the default items and a `closeMenu` callback, and returns the items to show:

```tsx
import { Dashboard, type InsightMenuItemsProvider } from "@gooddata/sdk-ui-dashboard";

const menuItems: InsightMenuItemsProvider = (_insight, widget, defaultItems, closeMenu) => [
    ...defaultItems,
    { type: "separator", itemId: "my-separator" },
    {
        type: "button",
        itemId: "copy-widget-id",
        itemName: "Copy widget ID",
        onClick: () => {
            void navigator.clipboard.writeText(widget.identifier);
            closeMenu();
        },
    },
];

export function DashboardPage({ dashboard }: { dashboard: string }) {
    return <Dashboard dashboard={dashboard} insightMenuItemsProvider={menuItems} />;
}
```

Items are buttons, separators, submenus, or groups; the `IInsightMenuItem` union in the API reference lists their fields. To restyle the menu or its button rather than its contents, replace them through `InsightMenuComponentProvider` and `InsightMenuButtonComponentProvider`. Plugins have no access to the menu. They can decorate the visualization instead, or trigger their own commands from a custom widget.

## Add a custom widget

A custom widget is content that isn't a saved visualization: a text block, a form, an image, your own component. You register a type name with its component and then place instances of it in the layout. The component gets `IDashboardWidgetProps`, where `widget` is your `ICustomWidget` with the `customType` and any extra data you passed to `newCustomWidget`. [Use custom widgets](../dashboard-plugins-api/#use-custom-widgets) covers registration and layout placement. To compute data that honors the dashboard filters, use [useCustomWidgetExecutionDataView](../use-custom-widget-data-view/), and to read the filters themselves, [useWidgetFilters](../use-widget-filters/).

## How drills flow

A drill starts in the body and travels up through commands and events. Knowing the sequence helps when you replace a layer or want to react to clicks from outside.

1. The Dashboard component computes `drillableItems` for each widget: the drill interactions the dashboard author configured on the widget, implicit drill-downs from attribute hierarchies, cross-filtering, [Key Driver Analysis](../../ai-modules/key-driver-analysis/), and anything you added with the `changeDrillableItems` command. The body gets them as a prop.
2. The user clicks a drillable point and the body calls `onDrill`. The dashboard dispatches the `drill` command and fires `GDC.DASH/EVT.DRILL.REQUESTED`.
3. The dashboard matches the click against the configured drill definitions and fires `GDC.DASH/EVT.DRILL.RESOLVED`. Its payload has the `drillEvent` with the clicked `intersection` and the matching `drillDefinitions`, and the `drillContext` with the `widget` and `insight`.
4. With exactly one matching definition that isn't restricted, the dashboard runs it right away. With several, with a restricted drill, or for Key Driver Analysis, which always offers a choice of comparisons, it shows a menu. With `disableDefaultDrills` set in the dashboard `config`, nothing runs after `RESOLVED` and your event handler decides. Each kind of drill has its own command and `REQUESTED`/`RESOLVED` pair: `DRILL_DOWN`, `DRILL_TO_INSIGHT`, `DRILL_TO_DASHBOARD`, `DRILL_TO_CUSTOM_URL`, `DRILL_TO_ATTRIBUTE_URL`, `CROSS_FILTERING`, and `KEY_DRIVER_ANALYSIS`, all under `GDC.DASH/EVT.DRILL.`.

Items you add with `changeDrillableItems` make points clickable without a configured drill. For those, `drillDefinitions` in the resolved event is empty and nothing else happens, so handle the click yourself. This plugin makes every point of the `revenue` measure clickable once the dashboard is initialized and logs the clicks:

```ts
import { HeaderPredicates } from "@gooddata/sdk-ui";
import {
    DashboardPluginV1,
    changeDrillableItems,
    type DashboardContext,
    type DashboardEventHandler,
    type DashboardInitialized,
    type IDashboardCustomizer,
    type IDashboardDrillResolved,
    type IDashboardEventHandling,
    isDashboardDrillResolved,
} from "@gooddata/sdk-ui-dashboard";

const onDrillResolved: DashboardEventHandler<IDashboardDrillResolved> = {
    eval: isDashboardDrillResolved,
    handler: (event) => {
        const { drillEvent, drillContext } = event.payload;
        // drillEvent.drillContext.intersection: the measure and attribute headers of the clicked point
        // drillEvent.drillDefinitions: configured drills that match the click, empty for your own items
        // drillContext.widget: the widget the click came from
    },
};

export class Plugin extends DashboardPluginV1 {
    public register(_ctx: DashboardContext, _customize: IDashboardCustomizer, handlers: IDashboardEventHandling): void {
        handlers.addEventHandler<DashboardInitialized>("GDC.DASH/EVT.INITIALIZED", (_event, dispatch) => {
            dispatch(changeDrillableItems([HeaderPredicates.identifierMatch("revenue")]));
        });
        handlers.addCustomEventHandler(onDrillResolved);
    }
}
```

Outside a plugin, pass the handlers in the `eventHandlers` prop of the `Dashboard` component; they receive the same `dispatch` argument. From a component rendered inside the dashboard, dispatch the command with [`useDispatchDashboardCommand`](../dashboard/#commands). [Handle dashboard events](../dashboard-events/) explains handlers in detail, and [Make visualizations drillable](../../integrations/interactivity/drillable-items/) explains the predicates for standalone charts, which the dashboard reuses here.
