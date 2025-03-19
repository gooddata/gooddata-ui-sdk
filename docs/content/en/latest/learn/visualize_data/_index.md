---
title: "Visualize Data"
linkTitle: "Visualize Data"
icon: "visualize.svg"
weight: 40
no_list: true
---

GoodData.UI offers the following methods of visualizing the data in your workspaces:

-  Using the [InsightView component](#VisualizeData-InsightViewcomponent)
-  Using the prebuilt [charts and plots](./charts_and_plots/)
-  Creating [custom visualizations](./create_custom_visualizations/)

Each method has its advantages and disadvantages.

This article explains how these methods differ and helps you decide which method is the most appropriate for your particular use case.

## InsightView component

Using the [InsightView component](./insightview/) is the simplest method to implement because it requires the smallest amount of code to get going.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

The InsightView component allows you to embed visualizations created in [Analytical Designer](https://www.gooddata.com/docs/cloud/create-visualizations/analytical-designer/) into your application as React components.
It always reflects the current state of an visualization: if any changes are made to the visualization in Analytical Designer,
the InsightView component in your application will pick them up and show the up-to-date version of the visualization without any actions needed from your side.

You can [generate the code](https://www.gooddata.com/docs/cloud/embed-visualizations/react-sdk/) for a particular InsightView directly in Analytical Designer.

### When to use

Using the InsightView component is the best choice in the following situations:

-   You want to embed visualizations created in Analytical Designer as is.

-   You want to be able to change the visualization that your application displays without changing the application code.
{{% alert %}}
You can also achieve this by creating the [custom visualizations](#custom-visualizations).
{{% /alert %}}

### When not to use

The InsightView component may not be the best choice in the following situations:

-   You need a visualization type that is not available in Analytical Designer or GoodData.UI.
     
     In this case, create a [custom visualization](#custom-visualizations).
-   You need more control over the visualization (for example, dynamically changing measures).
    
     In this case, use the prebuilt [charts and plots](#charts-and-plots) or create a [custom visualization](#custom-visualizations).

## Charts and Plots

GoodData.UI comes with several types of visualizations that you can use out of the box.
They require more coding than the [InsightView component](#insightview-component) but at the same time offer more flexibility.
For more information, see [Charts and Plots](./charts_and_plots/) .

You can [generate the code](https://www.gooddata.com/docs/cloud/embed-visualizations/react-sdk/#EmbedVisualizationsUsingReactSDK-EmbedVisualization) for a particular visual component directly in Analytical Designer.

### When to use

Using the visual components is the best choice in the following situations:

-   You want more control over the visualization than the [InsightView component](#insightview-component) can provide.
    
     {{% alert color="info" %}}Use the [visualization definition placeholders](./visualization_placeholders/) to be able to dynamically change the visualization easier.
    {{% /alert %}} 
-   You want to define the visualization only in your application and not in Analytical Designer.
    
     This can help you prevent inadvertent changes to your application coming from outside (changes made in Analytical Designer).

### When not to use

The visual components may not be the best choice in the following situations:

-   You want to be able to change the visualization that your application displays without changing the application code.
    
     In this case, use the [InsightView component](#insightview-component).
-   You need a visualization type that is not available in Analytical Designer or GoodData.UI.
    
     In this case, create a [custom visualization](#custom-visualizations).

## Custom visualizations

If neither the [InsightView component](#insightview-component) nor the [visual components](../../references/visual_components/) satisfy your needs, GoodData.UI allows you to create your own visualization relatively easy.
This is the most involved method of data visualization that offers the most flexibility. To get started, see [Custom Visualizations](./create_custom_visualizations/).

### When to use

Creating a custom visualization is the best choice in the following situations:

-   You need a visualization type that is not available in Analytical Designer or GoodData.UI.
-   You need more flexibility than the [visual components](#visual-components) can provide.

### When not to use

Do not use the custom visualizations if the [InsightView component](#insightview-component) or the [visual components](../../references/visual_components/) are sufficient for satisfying your needs. Whenever possible, choose one of the simpler methods because they require significantly less code.