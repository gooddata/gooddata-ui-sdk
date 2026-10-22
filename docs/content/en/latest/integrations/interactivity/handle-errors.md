---
title: Handle errors
category: Integrations / Interactivity
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui:GoodDataSdkError"
  - "@gooddata/sdk-ui:ErrorCodes"
  - "@gooddata/sdk-ui:convertError"
  - "@gooddata/sdk-backend-spi:AnalyticalBackendError"
source_files:
  - src/base/errors/GoodDataSdkError.ts
  - src/base/errors/errorHandling.ts
related_pages:
  - /docs/integrations/interactivity/error-component
  - /docs/integrations/authentication
  - /docs/data-layer/use-cancelable-promise
  - /docs/data-layer/use-execution-data-view
  - /docs/data-layer/execution/custom-executions
description: Tell an empty result from a failure, ignore canceled requests, and react to authentication and size limits by narrowing SDK errors with the is* guards instead of matching on message text.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 94
section: Integrations
subsection: Interactivity
---

Not every error deserves the same treatment. A result with no rows is an empty state, a canceled request is
noise, an expired session needs a login, and a result that is too large needs a filter. GoodData.UI gives every
failure a typed class and a type guard, so you can tell them apart without parsing messages.

## Two layers of errors

| Layer | Package | Base class | Where you get it |
|-------|---------|------------|----------------|
| Backend | `@gooddata/sdk-backend-spi` | `AnalyticalBackendError` | Promises from `backend.workspace(...)` calls, `useCancelablePromise` |
| UI | `@gooddata/sdk-ui` | `GoodDataSdkError` | `onError` callbacks, `error` from `useExecutionDataView` and the other data hooks, `ErrorComponent` |

The UI layer wraps the backend layer. `convertError(unknown)` performs that mapping and returns a
`GoodDataSdkError` for any input (a `GoodDataSdkError` passes through unchanged, anything unrecognized becomes
an `UnexpectedSdkError`), so you can normalize before you branch. A `GoodDataSdkError` exposes
`getErrorCode()`, one of the values in `ErrorCodes`, `getMessage()`, and `getCause()`.

## Handle errors in a component callback

```tsx
import { useState } from "react";
import {
    isCancelledSdkError,
    isDataTooLargeToDisplay,
    isNoDataSdkError,
    isUnauthorized,
    type GoodDataSdkError,
} from "@gooddata/sdk-ui";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

type ChartState = "ok" | "empty" | "too-large" | "failed";

export function SalesByRegion() {
    const [state, setState] = useState<ChartState>("ok");

    const handleError = (error: GoodDataSdkError) => {
        if (isCancelledSdkError(error)) {
            return; // a newer request replaced this one
        }
        if (isNoDataSdkError(error)) {
            setState("empty");
        } else if (isDataTooLargeToDisplay(error)) {
            setState("too-large");
        } else if (isUnauthorized(error)) {
            window.location.assign("/login");
        } else {
            setState("failed");
        }
    };

    if (state === "empty") {
        return <p>No sales match the current filters.</p>;
    }
    if (state === "too-large") {
        return <p>Add a filter to narrow the result.</p>;
    }
    if (state === "failed") {
        return <p>The chart could not be loaded.</p>;
    }

    return (
        <ColumnChart
            measures={[Md.Amount]}
            viewBy={Md.Region.Default}
            onError={handleError}
            ErrorComponent={() => null}
        />
    );
}
```

When you show your own message, pass an `ErrorComponent` that renders nothing; otherwise the built-in error
indicator appears as well. See [ErrorComponent](../error-component/).

## Handle errors from a direct backend call

Errors from `backend.workspace(...)` are backend errors. Narrow them with the guards from
`@gooddata/sdk-backend-spi`, or convert them first.

```ts
import { isAbortError, isNoDataError, type IAnalyticalBackend, type IDataView } from "@gooddata/sdk-backend-spi";
import * as Md from "./catalog.js";

export async function loadTotal(backend: IAnalyticalBackend, workspace: string): Promise<IDataView | undefined> {
    try {
        const result = await backend.workspace(workspace).execution().forItems([Md.Amount]).execute();
        return await result.readAll();
    } catch (error) {
        if (isAbortError(error) || isNoDataError(error)) {
            return undefined; // canceled or empty: nothing to show
        }
        throw error;
    }
}
```

`NoDataError` carries the `dataView` it was raised for when one exists, so you can still read headers from an
empty result.

## Error codes and guards

| `ErrorCodes` value | UI guard | Backend guard | Typical reaction |
|--------------------|----------|---------------|------------------|
| `NO_DATA` | `isNoDataSdkError` | `isNoDataError` | Show an empty state |
| `CANCELLED` | `isCancelledSdkError` | `isAbortError` | Ignore |
| `UNAUTHORIZED` | `isUnauthorized` | `isNotAuthenticated` | Start the login flow |
| `DATA_TOO_LARGE_TO_DISPLAY` | `isDataTooLargeToDisplay` | | Ask for a filter; the analytics engine computed the result but the visualization refuses to render it |
| `DATA_TOO_LARGE_TO_COMPUTE` | `isDataTooLargeToCompute` | `isDataTooLargeError` | Ask for a filter; the analytics engine refused the request |
| `NOT_FOUND` | `isNotFound` | `isUnexpectedResponseError` with `httpStatus` 404 | The object was deleted or the identifier is wrong |
| `PROTECTED_REPORT` | `isProtectedReport` | `isProtectedDataError` | The user lacks permission for the data |
| `BAD_REQUEST` | `isBadRequest` | `isUnexpectedResponseError` with `httpStatus` 400 | Fix the execution definition |
| `UNKNOWN_ERROR` | `isUnknownSdkError` | `isUnexpectedError`, or `isUnexpectedResponseError` with any other `httpStatus` | Show a generic message, log the cause |

`isGoodDataSdkError` and `isAnalyticalBackendError` tell the two layers apart when a `catch` block receives
`unknown`.

## Notes

- `getCause()` on a `GoodDataSdkError` returns the wrapped backend error, including the `httpStatus` of an
  `UnexpectedResponseError`.
- The visualization components already map the common codes to a localized `message` and `description` (see
  `newErrorMapping`) before they render `ErrorComponent`. Handle errors yourself only when you want a different
  reaction, not different text.
