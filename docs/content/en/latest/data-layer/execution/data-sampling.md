---
legacy_path: learn/get_raw_data/data_sampling
title: Sample data to speed up executions
linkTitle: Data sampling
category: Data layer / Execution
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:IExecutionConfig"
  - "@gooddata/sdk-ui-ext:InsightView"
source_files:
  - src/execution/executionDefinition/index.ts
related_pages:
  - /docs/visualisations/insightview
  - /docs/dashboard-plugins/dashboard-performance
  - /docs/data-layer/execution/custom-executions
  - /docs/data-layer/execution/execution-model
description: Speed up visualizations by processing a percentage of dataset rows using the execConfig dataSamplingPercentage option.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 86
section: Data layer
subsection: Execution
aliases:
  - "../../learn/get_raw_data/data_sampling/"
---

Use data sampling to check a visualization quickly: the backend processes only a percentage of the rows in the fact datasets instead of all of them. For how sampling works in GoodData, see [Data sampling](https://www.gooddata.ai/docs/cloud/create-visualizations/visualization-properties/#data-sampling) in the GoodData Cloud docs.

{{% alert color="warning" title="Vertica only" %}}
Data sampling works only in workspaces that use a Vertica data source without table views.
{{% /alert %}}

## Sample the data of a visualization

Pass `dataSamplingPercentage` in the `execConfig` prop. The value is a percentage of the available rows, so `5` runs the execution on five percent of the data:

```tsx
import { InsightView } from "@gooddata/sdk-ui-ext";

export const SampledVisualization = () => (
    <InsightView
        insight="<visualization-id>"
        execConfig={{ dataSamplingPercentage: 5 }}
    />
);
```

Smaller values return faster but give rougher aggregates; larger values are closer to the real numbers but take longer.

## Notes

- `execConfig` is an `IExecutionConfig` object, so you can combine `dataSamplingPercentage` with other execution options, such as a time zone or a date format.
- Sampling changes only the execution on the backend. Loading, error handling, and drilling of `InsightView` work the same.
- The results are approximate. Don't sample executions behind exports or numbers your users rely on, and remove the option before you ship a dashboard to production.
