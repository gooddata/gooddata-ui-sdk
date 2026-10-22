---
title: Data layer
linkTitle: "Data layer"
weight: 60
description: Execute analytics queries, work with the data model, and consume results programmatically.
diataxis_type: reference
ai_generated_body: true
type: docs
section_overview: true
aliases:
  - "learn/get_raw_data/"
---

Work with data outside the prebuilt visualizations. Use the execution components and hooks to run your own executions, read the results, and export data, for example to feed a custom visualization or a third-party charting library.

The components (`Execute`, `RawExecute`, `ExecuteInsight`) run an execution and pass the result to a render-prop child. The hooks (`useExecutionDataView`, `useInsightDataView`, `useDataExport`, `useCancelablePromise`, `usePagedResource`) return a status-bearing object you can render from. [Execution](execution/) describes what the backend computes and how the result is shaped, and [Data model](data-model/) covers the `@gooddata/sdk-model` objects that executions take as input.
