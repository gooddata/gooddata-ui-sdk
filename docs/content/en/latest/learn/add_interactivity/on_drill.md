---
title: OnDrill
sidebar_label: OnDrill
copyright: (C) 2007-2018 GoodData Corporation
id: on_fire_drill_event
---

The `onDrill` parameter allows you to catch drilling events from visualizations on non-embedded KPI dashboards and to respond to them using the function that you have chosen to use and implemented.

When a user clicks a [drillable item](../drillable_items/) in a visualization on a non-embedded KPI dashboard, a default drill event is generated. This event has a format of `{ drillContext, executionContext }` and is sent to the function that you have chosen.

* If you want the default drilling event not to be generated, the function must return `false`. In this case, only what you have implemented in the function body is performed.
* When the function returns anything else but `false`, whatever you have implemented in the function body is performed, and then the default drilling event is also generated.

## Example

```jsx
import { InsightView } from "@gooddata/sdk-ui-ext";
import { HeaderPredicates } from "@gooddata/sdk-ui";

<InsightView
   insight="<visualization-identifier>"
   config={<chart-config>}
   onDrill={(event) => { console.log(event.dataView); }}
   drillableItems={[
        HeaderPredicates.identifierMatch("drillable-Identifier1"),
        HeaderPredicates.uriMatch("/drillable-Uri2")
   ]}
/>
```