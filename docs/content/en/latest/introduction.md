---
title: "Introduction"
linkTitle: "Introduction"
weight: 11
---

GoodData.UI is the go-to SDK, when it comes to embedding, visualizing your data or creating custom visualizations with GoodData.

{{% embedded-image alt="Visuals" src="/visuals.png" title="Visuals" width="80%" %}}


It is built on top of TypeScript, so it is versatile, yet very fast.

GoodData.UI works best with:


{{< blocks/cards-container aligned="true">}}

{{< blocks/card title="Web Components" icon="webcomponents-logo.svg" iconPosition="top" extLink="../learn/embed_dashboards/web_components/" >}}
{{< /blocks/card >}}

{{< blocks/card icon="react-logo.svg" title="React" iconPosition="top" extLink="../quick_start/" >}}
{{< /blocks/card >}}

{{< blocks/card icon="javascript-logo.svg" title="REST API Clients" iconPosition="top" extLink="../learn/get_raw_data/">}}
{{< /blocks/card >}}

{{< /blocks/cards-container >}}


GoodData.UI excells at creating Visualizations and Embedding, but can also help you retrieve data directly from the GooodData analytics engine. Here is an overview:

![Embedding Methods Overview](intro-embedding-methods.png)

{{% alert color="info" title="Embedding Without GoodData.UI?" %}}It is possible to add GoodData dashboards to your website using iframes, without the need to utilize the GoodData.UI library. See [Embed Visualizations Using Iframes](https://www.gooddata.com/docs/cloud/embed-visualizations/iframes/) in the GoodData Cloud documentation for more information. Keep in mind that only GoodData.UI allows for the embedding of individual visualizations.
{{% /alert %}}

## Web Components

Web Components let you embed visualizations and dashboards easily, while allowing for a high level of integration with the host application. Customization is limited to assigning a title and changing the localization.

In the simplest form, the integration could look something like this:

```html
<!-- Load the library... -->
<script type="module" src="<host_url>/components/<workspace_id>.js?auth=sso">
</script>

<!-- ...and embed a dashboard! -->
<gd-dashboard dashboard="<dashboard_id>"></gd-dashboard>

<!-- ...or an individual visualizations! -->
<gd-insight insight="<visualizations_id>"></gd-insight>
```

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

The result may look like this:

![dashboard embeded with web components](intro-web-components-dashboard.png)

The Web Components library is part of the GoodData.UI. It is loading React and all the necessary dependencies. However, it runs in an isolated scope that will not conflict with other JavaScript running in your app.

See [Introduction to GoodData Web Components](../learn/embed_dashboards/web_components/) to get started.

## React

Embed visualizations directly into your web application as live components, or build custom permanent components which give you a more granular control over the data flow management and the level of integration with the rest of your application.

### InsightView and DashboardView

GoodData.UI features the `InsightView` and `DashboardView` components, enabling seamless embedding of visualizations and dashboards crafted and stored within GoodData simply by referencing their unique IDs.

Any changes you make to the embedded visualization or dashboard in your GoodData deployment will be automatically updated and reflected in your application:

```javascript
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";
import * as Md from "../../md/full";

export function MyComponent() {
    return (
        <div style={{height:300}}>
            <InsightView
                insight={Md.Insights.MyInsight}
            />
        </div>
    );
}
```

The result may look like this:

![react live insight](intro-react-live-visualization.png)

See [InsightView](../learn/visualize_data/insightview/) and [Introduction to the Dashboard Component](../references/dashboard_component/) to learn more about `InsightView` and `DashboardView` components.

### Visualizations

Not only can you reference pre-existing visualizations or dashboards, but you can also create and tailor a visualization directly within your React code.

For instance, by employing one of the supported visualization components, such as a Treemap, you can exhibit the data of your choice. Like so:

```javascript
import React from "react";
import { Treemap } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const numberOfChecks = modifyMeasure(Md.NrChecks, (m) =>
    m.format("#,##0").alias("# Checks").title("Number of Checks"),
);

export const TreemapExample = () => {
    return (
        <div style={{ height: 300 }}>
            <Treemap
                measures={[numberOfChecks]}
                viewBy={Md.LocationState}
                segmentBy={Md.LocationCity}
            />
        </div>
    );
};
```

The result may look like this:

![treemap visualization](intro-treemap-visualization.png)

See [Start with Visual Components](../references/visual_components/) to get started

You can also create entirely new components and visualizations from scratch.

{{% alert color="info" title="Tip on Getting Started with React Components" %}} GoodData lets you copy and paste automatically generated React code snippets directly from the web interface. It's a great way to get started with the GoodData.UI framework. See [Embed Visualizations Using React SDK](https://www.gooddata.com/docs/cloud/embed-visualizations/react-sdk/) in the GoodData Cloud documentation to get started.
{{% /alert %}}

## REST API Clients

The REST API Clients provides a way to directly retrieve data from the GoodData analytics engine. To learn how to utilize GoodData.UI for fetching data, refer to the [Get Raw Data](../learn/get_raw_data/) section. This data can be integrated into your custom frontend application or transferred to your Node.js backend application.

