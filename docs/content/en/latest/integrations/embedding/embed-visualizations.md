---
legacy_path: learn/embed_dashboards/embed_insights
title: Embed visualizations
category: Integrations / Embedding
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-ext:InsightView"
source_files:
  - src/insightView/InsightView.tsx
props_interfaces:
  - IInsightViewProps
  - Partial<IVisualizationCallbacks>
related_pages:
  - /docs/visualisations/insightview
  - /docs/integrations/web-components/insight-custom-element
  - /docs/integrations/embedding/embed-dashboards
  - /docs/integrations/interactivity/drillable-items
  - /docs/integrations/embedding/apply-theming
description: Render a visualization saved in Analyze with InsightView by getting its identifier, importing the component and styles, and setting its insight prop.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 78
section: Integrations
subsection: Embedding
aliases:
  - "../../learn/embed_dashboards/embed_insights/"
---

To embed a visualization saved in [Analyze](https://www.gooddata.ai/docs/cloud/create-visualizations/), use the [`InsightView`](../../../visualisations/insightview/) component.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

1. Get the identifier of the visualization. Copy it from the browser's address bar when the visualization is open in Analyze, or use the `Insights` constants that [catalog-export](../../../data-layer/data-model/export-catalog/) generates.

2. Render `InsightView` with that identifier, and import the styles of `@gooddata/sdk-ui-ext` once in your app:

    ```tsx
    import { InsightView } from "@gooddata/sdk-ui-ext";
    import "@gooddata/sdk-ui-ext/styles/css/main.css";

    export function MyVisualization() {
        return (
            <div style={{ height: 400 }}>
                <InsightView
                    insight="<visualization-id>"
                    config={{
                        colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"],
                        legend: {
                            enabled: true,
                            position: "bottom",
                        },
                    }}
                />
            </div>
        );
    }
    ```

    `InsightView` reads the backend and the workspace from `BackendProvider` and `WorkspaceProvider`; pass the `backend` and `workspace` props to override them. See [Integrate into an existing application](../../backend-setup/#provide-the-backend-and-workspace).

For every prop of the component, see [`InsightView`](../../../visualisations/insightview/#props).
