---
title: useDataExport
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useDataExport"
source_files:
  - src/execution/useDataExport.ts
related_pages:
  - /docs/data-layer/use-execution-data-view
  - /docs/integrations/interactivity/on-export-ready
  - /docs/dashboard-plugins/customize-dashboard-export
  - /docs/integrations/embedding/build-custom-frontend
  - /docs/data-layer/use-insight-data-view
description: Use useDataExport to run CSV, XLSX, or raw exports from a prepared execution, handle export lifecycle callbacks, and retrieve the download URI.
ai_generated_description: true
type: docs
weight: 62
section: Data layer
---

Hook for exporting data in CSV, XLSX, or raw format for a prepared execution.

Returns a URI string that can be used to create a download link. The export is re-executed only when the dependency list changes, not on execution or config changes.

{{% alert color="info" %}}
`useDataExport` exports a raw `IPreparedExecution`. To export a rendered visualization component instead, such as a standalone `InsightView`, use [`onExportReady`](../../integrations/interactivity/on-export-ready/).
{{% /alert %}}

## Basic usage

```tsx
import type { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { useDataExport } from "@gooddata/sdk-ui";

function ExportButton({ execution }: { execution: IPreparedExecution }) {
    const { result: exportUri, status, error } = useDataExport(
        {
            execution,
            exportConfig: { format: "csv" },
            onSuccess: (uri) => {
                window.open(uri);
            },
        },
        [execution],
    );

    if (status === "loading") {
        return <button disabled>Exporting...</button>;
    }

    if (status === "error") {
        return <div>Export failed: {error?.message}</div>;
    }

    return exportUri ? <a href={exportUri}>Download CSV</a> : null;
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `execution` | `IPreparedExecution \| undefined \| null` | Prepared execution to export data from. See [Run a custom execution](../execution/custom-executions/) to build one from measures, attributes, and filters. |
| `exportConfig` | `IExportConfig` | Export configuration (format, mergeHeaders, etc.). Defaults to `{}`. |
| `onSuccess` | `(uri: string) => void` | Called with the export URI when export completes. |
| `onError` | `(err: GoodDataSdkError) => void` | Called when export fails. |
| `onCancel` | `() => void` | Called when an in-flight export is cancelled (for example, because a dependency changed). |
| `onLoading` | `() => void` | Called when the export transitions into the loading state. |
| `onPending` | `() => void` | Called when the hook is in a pending state (no execution to export yet). |
| `deps` | `DependencyList` | Dependency list that triggers re-export. |

## Return value

`UseCancelablePromiseState<string, GoodDataSdkError>` — status with `result` containing the download URI on success.

## States

| status | result | error | When |
|--------|--------|-------|------|
| `"pending"` | `undefined` | `undefined` | `execution` is `undefined` or `null`. `onPending` is called. |
| `"loading"` | `undefined` | `undefined` | The export is running: `execution.execute()`, then `export(exportConfig)` on the result. `onLoading` is called. This is also the state on the first render and right after `deps` change when `execution` is set. |
| `"success"` | `string` (export URI) | `undefined` | The export finished. `onSuccess` is called with the URI. |
| `"error"` | `undefined` | `GoodDataSdkError` | The execution or export failed. The original error is converted to a `GoodDataSdkError`. `onError` is called. |

## When it re-runs

- The export restarts when a value in `deps` changes. Values are compared by reference.
- A change in `execution`, `exportConfig`, or a callback doesn't restart the export on its own. The next run uses the values from the render in which `deps` changed.
- If you omit `deps`, the export restarts after every render, including the renders its own state changes cause, so it exports repeatedly. Always pass `deps`.
- If the previous export hasn't finished when `deps` change or the component unmounts, its result is ignored and `onCancel` is called. The backend request itself is not aborted.
- On the render where `deps` change, the hook returns `"loading"` (or `"pending"` without an execution) right away instead of the previous result.

## Notes

- `useDataExport` needs no `BackendProvider` or `WorkspaceProvider`. It uses the backend of the prepared execution.
- The length of `deps` must stay the same between renders. If it changes, the hook throws an `UnexpectedSdkError`.
- `useDataExport` is built on [`useCancelablePromise`](../use-cancelable-promise/).
