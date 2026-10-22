---
title: useDashboardSelector
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:useDashboardSelector"
  - "@gooddata/sdk-ui-dashboard:DashboardSelector"
  - "@gooddata/sdk-ui-dashboard:DashboardSelectorEvaluator"
  - "@gooddata/sdk-ui-dashboard:SingleDashboardStoreAccessor"
source_files:
  - src/model/react/DashboardStoreProvider.tsx
  - src/model/store/types.ts
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/use-dashboard-dispatch
  - /docs/dashboard-plugins/use-widget-filters
  - /docs/dashboard-plugins/customize-widgets
description: Read Dashboard component state with useDashboardSelector and the select* selectors, from components, event handlers, and outside code.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 42
section: Dashboard & plugins
---

`useDashboardSelector` reads one value from the state of the `Dashboard` component. Pass it a selector; it returns the selector's result and re-renders your component when that result changes.

Selectors are memoized: for the same state they return the same reference, so their results are safe to use as dependencies of `useMemo` and `useEffect`.

The component that calls the hook must render inside the `Dashboard` component. That covers custom widgets, components registered through the customization API, and plugin decorators. For code that runs outside the component, see [Read state outside the Dashboard component](#read-state-outside-the-dashboard-component).

## Basic usage


The most common use is to hand rendering back to the built-in component in edit mode:

```tsx
import {
    DefaultDashboardInsight,
    selectIsInEditMode,
    useDashboardSelector,
    type IDashboardInsightProps,
} from "@gooddata/sdk-ui-dashboard";

export function CustomInsight(props: IDashboardInsightProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    return isInEditMode ? (
        <DefaultDashboardInsight {...props} />
    ) : (
        <div>Custom rendering of {props.widget.title}</div>
    );
}
```

Register the component with `customize.insightWidgets().withCustomProvider(...)` in your plugin. See [Dashboard plugins API](../dashboard-plugins-api/).

### Selectors with parameters


Some selectors are factories. Call the factory with the parameter and pass the result to the hook. Factories are memoized per argument, so calling one during render doesn't create a new selector each time.

```tsx
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import { selectFilterContextAttributeFilterItemByDisplayForm, useDashboardSelector } from "@gooddata/sdk-ui-dashboard";
import * as Md from "./catalog.js";

const regionDisplayForm = attributeDisplayFormRef(Md.Region.Default);

export function RegionFilterSummary() {
    const regionFilter = useDashboardSelector(
        selectFilterContextAttributeFilterItemByDisplayForm(regionDisplayForm),
    );

    return <span>{regionFilter ? "Region filter is set" : "No region filter"}</span>;
}
```

### Turn a customization on per dashboard


Dashboard tags let a plugin decide, per dashboard, whether to apply itself. Dashboard authors add or remove the tag in GoodData Cloud, so you don't need to redeploy the plugin. Use the pattern from [Basic usage](#basic-usage), with a tag check in place of the edit-mode check:

```tsx
const isEnabled = useDashboardSelector(selectDashboardTags).includes("custom-rendering");
```

To decide by the visualization's tag instead of the dashboard's, use `customize.insightWidgets().withTag(tag, component)`.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `(state: DashboardState) => TResult` | The selector to evaluate, usually one of the `select*` functions exported by `@gooddata/sdk-ui-dashboard`. |

### Commonly used selectors


| Selector | Returns | Use it to |
|----------|---------|-----------|
| [`selectIsInEditMode`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectisineditmode.md" >}}) | `boolean` | Fall back to the default component in edit mode |
| [`selectIsExport`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectisexport.md" >}}) | `boolean` | Simplify rendering when the dashboard is exported to PDF |
| [`selectDashboardId`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectdashboardid.md" >}}) | `string \| undefined` | Key persisted UI state or build links to the dashboard |
| [`selectDashboardRef`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectdashboardref.md" >}}) | `ObjRef \| undefined` | Pass the dashboard to `IAnalyticalBackend` calls |
| [`selectDashboardTitle`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectdashboardtitle.md" >}}) | `string` | Show the title in a custom top bar |
| [`selectDashboardTags`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectdashboardtags.md" >}}) | `string[]` | Turn a customization on for selected dashboards |
| [`selectFilterContextFilters`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectfiltercontextfilters.md" >}}) | `FilterContextItem[]` | Read every dashboard-level filter |
| [`selectFilterContextDateFilter`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectfiltercontextdatefilter.md" >}}) | `IDashboardDateFilter \| undefined` | Read the dashboard date filter |
| [`selectFilterContextAttributeFilterItemByDisplayForm(ref)`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectfiltercontextattributefilteritembydisplayform.md" >}}) | `DashboardAttributeFilterItem \| undefined` | Read one attribute filter by its display form |
| [`selectLayout`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectlayout.md" >}}) | `IDashboardLayout` | Walk sections, items, and widgets |
| [`selectInsights`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectinsights.md" >}}) | `IInsight[]` | List the visualizations placed on the dashboard |
| [`selectSettings`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectsettings.md" >}}) | `ISettings` | Read workspace and user settings |
| [`selectLocale`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.selectlocale.md" >}}) | `ILocale` | Format text for the dashboard locale |

The full list is in the [API reference]({{< relref "/latest/api-reference/sdk-ui-dashboard" >}}).

## Return value

The selector's result for the current dashboard state. The component re-renders when the result changes.

## Notes


- Selectors marked `@alpha` or `@internal` on their reference page can change or disappear in a minor release. See [API maturity](../../integrations/platform/api-maturity/).
- To get the effective `IFilter[]` for a widget, use `useWidgetFilters` instead of merging `selectFilterContextFilters` with the visualization's own filters yourself. The hook applies the widget's ignored filters and date dataset for you.
- Selectors only read. To change the dashboard, dispatch a command with `useDispatchDashboardCommand`; see [Dashboard component](../dashboard/#commands).
- `useDashboardSelector` throws when rendered outside the `Dashboard` component tree. Code outside the tree reads state through `SingleDashboardStoreAccessor`; see [Read state outside the Dashboard component](#read-state-outside-the-dashboard-component).
### Read state in an event handler


Event handlers receive a `stateSelect` function that accepts the same selectors as the hook. See [Handle dashboard events](../dashboard-events/#read-state-and-dispatch-from-a-handler).

### Read state outside the Dashboard component


Pass the change handler of `SingleDashboardStoreAccessor` to the `onStateChange` prop. The accessor then exposes a `DashboardSelectorEvaluator` you can call from anywhere in your application.

```tsx
import { Dashboard, selectDashboardTitle, SingleDashboardStoreAccessor } from "@gooddata/sdk-ui-dashboard";

export function DashboardPage({ dashboard }: { dashboard: string }) {
    return <Dashboard dashboard={dashboard} onStateChange={SingleDashboardStoreAccessor.getOnChangeHandler()} />;
}

export function currentDashboardTitle(): string | undefined {
    if (!SingleDashboardStoreAccessor.isAccessorInitialized()) {
        return undefined;
    }

    return SingleDashboardStoreAccessor.getDashboardSelect()(selectDashboardTitle);
}
```

Call `getDashboardSelect()` each time you need a value. The component replaces the evaluator after every state change, so a stored one keeps returning stale state.

To follow more than one dashboard, use `DashboardStoreAccessorRepository`. See [Access the state of the Dashboard component from outside the component](../dashboard/#access-the-state-of-the-dashboard-component-from-outside-the-component).
