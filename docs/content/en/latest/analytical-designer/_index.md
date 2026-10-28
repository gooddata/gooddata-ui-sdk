---
title: Analytical Designer
weight: 35
description: Embed Analytical Designer, the GoodData editor for creating and editing visualizations, in your React application as a component.
diataxis_type: reference
ai_generated_body: true
type: docs
section_overview: true
---

Analytical Designer is the GoodData editor for creating visualizations from your data. The user drags attributes, metrics, and facts from the catalog into the drop zones, changes the visualization type and its properties in the configuration panel, filters the data, and saves the result so that it can be added to dashboards. For how the editor works for its users, see [Analytical Designer](https://www.gooddata.ai/docs/cloud/create-visualizations/concepts/analytical-designer/) in the GoodData Cloud documentation.

`@gooddata/sdk-ui-analytical-designer` is the Analytical Designer application as a React component, `AnalyticalDesigner`. It looks and works the same as Analytical Designer in GoodData Cloud: the same catalog, drop zones, configuration panel, filters, and saving. You render it inside your own React application, on your backend instance, without an iframe. You configure it with props, react to what the user does through typed callbacks, send it commands through a ref, and replace parts of its user interface with your own components. It is the counterpart of the [Dashboard component](../dashboard-plugins/dashboard/) for visualizations.

{{% alert color="warning" title="Alpha API" %}}
The whole public API of `@gooddata/sdk-ui-analytical-designer` is `@alpha`: it can change outside of the usual SemVer guarantees. See [API maturity](../integrations/platform/api-maturity/) before you depend on it.
{{% /alert %}}

Start with [Embed Analytical Designer](embed-analytical-designer/), then look up the props on the [AnalyticalDesigner component](analytical-designer/) page. To open Analytical Designer from an embedded dashboard instead, see [Edit visualizations on a dashboard](../dashboard-plugins/edit-visualizations-on-dashboard/).
