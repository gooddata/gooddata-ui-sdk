---
title: Charts and Plots
linkTitle: Charts and Plots
copyright: (C) 2007-2020 GoodData Corporation
weight: 11
---

GoodData.UI comes with ready-made visual components. You can use these visual components as-is or customize them. You can also use the unique [InsightView](../insightview/) component that simply renders any chart that you create in GoodData.

This article goes over the basic functionality of these visual components. To see the full list of supported components, see the [references](../../../references/visual_components/).

## Responsive UI

The visual components are responsive by nature and take the whole space of their wrapper element. This behavior implicates that if you want to create a visualization with a specific `height` and `width`, you must specify those dimensions in the wrapper element. Otherwise, the visualization may not be visible.

### Example

```javascript
<div style={{ height: 400, width: 600 }}>
    <AreaChart ... />
</div>
```

## Visual component props

The component props can be of the following types:

* **Style props** that define the style and interaction
* **Data props** that define what data to calculate and render

The style props define style and interaction of a visualization. For more information, see the articles in the Properties section.

The data props pass measures and attributes. These props are similar to the drag and drop sections in [Analytical Designer](https://help.gooddata.com/pages/viewpage.action?pageId=86794494) and use similar names such as "View by", "Stack by" and so on.
A data prop can be a single value or an array of either the `IMeasure` or `IAttribute` type, which is passed to the component as an object literal.

You can find more information about data props in the articles about individual components in the Visual Components section.

### Example
```js
const style = { height: 300 };

<div style={style}>
    <AreaChart
        measures={[Md.$TotalSales]}
        viewBy={Md.TimelineMonth.Long}
    />
</div>
```

## Visualization lifecycle

The visualization lifecycle is a series of events that take place between mounting and rendering a visualization.

The following component props can be used as lifecycle callbacks:

| Property | Description | Parameters |
| :--- | :--- | :--- |
| onLoadingChanged | A function that is called when a loading state changes | ```{ isLoading: boolean }``` |
| onError | A function that is called when an error state changes | ```{ status: string, ...}``` |
| onExportReady  | A function that is called when the underlying data can be exported | `function` |
| onLegendReady  | A function that is called when a chart legend is rendered | ```{ legendItems: [...] }``` |

### Visualization rendered successfully

If a visualization is successfully rendered, the following events occur:

1. The visualization is mounted and rendered immediately using ```LoadingComponent```.
2. The `onLoadingChanged` callback is called with a parameter of ```{ isLoading: true }```.
3. The `onError` callback is called with a parameter of ```{ status: "OK" }```.
4. The `onLoadingChanged` callback is called with a parameter of ```{ isLoading: false }```.
5. The visualization is rendered.
6. The `onExportReady` callback is called with a function that you can call to trigger the export.
6. For visualizations that have a legend, the `onLegendReady` callback is called with a parameter of ```{ legendItems: [...] }```.

### Visualization failed to render

If an error is encountered during rendering a visualization (for example, too much data to display), the following events occur:

1. The visualization is mounted and rendered immediately using ```LoadingComponent```.
2. The `onLoadingChanged` callback is called with a parameter of ```{ isLoading: true }```.
3. The `onError` callback is called with a parameter of ```{ status: "OK" }```.
4. The `onLoadingChanged` callback is called with a parameter of ```{ isLoading: false }```.
5. The `onError` callback is called with the following parameter:
    ```json
    {
        "status": "DATA_TOO_LARGE_TO_DISPLAY",
        "options": {
            "dateOptionsDisabled": false
        }
    }
    ```

6. The visualization is rerendered using ```ErrorComponent```.