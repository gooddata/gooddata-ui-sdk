---
title: "Add Interactivity"
linkTitle: "Add Interactivity"
icon: "icon-react.svg"
weight: 100
no_list: true
---

There are three ways how to easily add interactivity to your GoodData use-cases:

- [Drilling](#drilling)
- [InsightView Parameters](#parameters)
- [Components](#components)
- [Semantic Search](#semantic-search)

# Drilling

Drilling is the process of “zooming in” on a single measure value by filtering out all other data and breaking that value across a new attribute of interest. To add drilling, use function predicates. To turn on eventing and drilling, specify at least one `drillableItem`.

Drilling can be extremely easy to implement, here is an example:

```jsx
// Example of event drilling on the visualization from the GoodSales demo workspace.
import { HeaderPredicates } from "@gooddata/sdk-ui";

function onDrillHandler(event) {
    // handle drill
}

<InsightView
    insight="aby3polcaFxy"
    drillableItems={[
        HeaderPredicates.composedFromUri("/gdc/md/la84vcyhrq8jwbu4wpipw66q2sqeb923/obj/9211"),
        HeaderPredicates.composedFromIdentifier("label.owner.department"),
    ]}
    onDrill={onDrillHandler}
/>;
```

Drilling basically boils down to this structure:

- `IHeaderPredicate` defines the function that accepts `IMappingHeader` and context as its parameters and returns a boolean value.
- This function is executed against every measure and attribute in a visualization.
    - If the function returns true, the measure or attribute is drillable.
    - If the function returns false, the measure or attribute is not drillable.

You can program any logic to determine whether a particular measure or attribute should be drillable. However, this is not required often. For more information, see [Header Predicates](./predicates/).

# Parameters

InsightView parameters like [OnExportReady](./on_export_ready/), [OnLegendReady](./on_legend_ready/), etc... return a function attributed to them (e.g. `onExportReady` returns `getExportedData`). This makes it very easy to interactively react to a whole plethora of different scenarios.

A very basic example of how to implement such a function:

```jsx
import { InsightView } from "@gooddata/sdk-ui-ext";

<InsightView
    insight="<visualization-identifier>"
    onExportReady={(getExportedData) => {
        /* hold onto function and call to do export as needed */
    }}
/>;
```

# Components

Component indicators ([ErrorComponent](./error_component/), [LoadingComponent](./loading_component/), etc...) are a property that enables you to customize what content is displayed for their respective visual component state. .

Very basic example of such a scenario:

```jsx
// custom color, fixed size, indicator size, and speed of animation.
import { Component } from "react";
import { Kpi, LoadingComponent } from "@gooddata/sdk-ui";
import * as Md from "./md/full";

export class CustomisedLoadingComponentExample extends Component {
    render() {
        return <LoadingComponent color="tomato" height={300} imageHeight={16} speed={2} />;
    }
}

export default CustomisedLoadingComponentExample;

<Kpi measure={Md.$FranchiseFees} LoadingComponent={CustomisedLoadingComponentExample} />;
```

You can also disable the default setting Component indicators by explicitly passing null instead:

```jsx
import { Kpi } from "@gooddata/sdk-ui";
import * as Md from "./md/full";

<Kpi measure={Md.$FranchiseFees} format="<format>" LoadingComponent={null} ErrorComponent={null} />;
```

# Semantic Search

{{% alert color="info" title="Early Access Feature" %}}
Semantic Search is currently in development and is available on request as an early access feature. If you are interested in testing it, please contact our support team.
{{% /alert %}}

Semantic Search is a powerful search tool that enables users to find dashboards, visualizations, metrics, datasets, date instances, attributes, labels, and facts by searching through their names, descriptions, or tags. This feature is designed to help users quickly and easily locate the insights they need.

Unlike traditional full-text search, Semantic Search accommodates queries that include synonyms, typos, and even requests in different languages.

The GoodData.UI SDK includes a `SemanticSearch` component that you can integrate into your application.

Here is an example of how to use the `SemanticSearch` component:

```jsx
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";

const App = () => {
    return (
        <SemanticSearch
            // A workspace to search in. Can be omitted if you are using workspace provider.
            workspace="your-workspace-id"
            // A backend to use for the search. Can be omitted if you are using backend provider.
            backend={backend}
            // An optional locale to use for the search UI.
            locale="en-US"
            // An optional class name to use for the search UI.
            className={"your-custom-class"}
            // An optional placeholder for the search input.
            placeholder="Search for insights..."
            // An optional list of object types to search for.
            objectTypes={[
                "visualization",
                "dashboard",
                "metric",
                "date",
                "dataset",
                "attribute",
                "label",
                "fact",
            ]}
            // A callback that is called when the user selects an item in the search results.
            onSelect={(item) => {
                console.log("Selected item:", item);
            }}
            // An optional callback that is called when an error occurs during the search.
            onError={(error) => {
                console.error("An error occurred during the search:", error);
            }}
            // An optional limit on the number of search results to display.
            limit={10}
        />
    );
};
```
