---
title: Filters
weight: 40
description: Filter components and hooks for building interactive analytics UIs.
diataxis_type: explanation
ai_generated_body: true
type: docs
aliases:
  - "references/filters/"
---

GoodData.UI lets users narrow down what a chart, pivot table, or dashboard shows. The SDK covers the four filter types the analytics engine understands: attribute filters (single- and multi-select element pickers), date filters (absolute ranges, relative ranges, and presets), measure value filters (numeric comparisons), and ranking filters (top and bottom N by a measure).

Each filter is available as a ready-to-use React component. Attribute filters also come as two headless hooks, `useAttributeFilterController` and `useAttributeFilterHandler`, so you can build your own UI while reusing the SDK's loading, paging, and selection logic. The filters you create plug into a [dashboard](../dashboard-plugins/dashboard/) or into standalone [visualizations](../visualisations/) through their `filters` prop.
