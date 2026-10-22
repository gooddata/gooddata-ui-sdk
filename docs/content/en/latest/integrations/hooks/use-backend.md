---
title: useBackend
category: Integrations / Hooks
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useBackend"
  - "@gooddata/sdk-ui:useBackendStrict"
source_files:
  - src/base/react/BackendContext.tsx
related_pages:
  - /docs/integrations/hooks/use-workspace
  - /docs/integrations/hooks/use-organization
  - /docs/integrations/backend-setup
  - /docs/integrations/authentication
  - /docs/dashboard-plugins/dashboard-performance
description: Retrieve the analytical backend from BackendProvider context, with an optional prop override or strict variant.
ai_generated_description: true
type: docs
weight: 96
section: Integrations
subsection: Hooks
---

`useBackend` returns the analytical backend provided to `BackendProvider`. If you pass a backend, the hook returns it instead, so a component can accept a `backend` prop that wins over the context. `useBackendStrict` does the same but throws when no backend is available.

## Basic usage

```tsx
import { useBackend } from "@gooddata/sdk-ui";

function MyComponent({ backend: backendProp }) {
    // Uses backendProp if defined, otherwise falls back to context value
    const backend = useBackend(backendProp);

    // backend may be undefined if neither prop nor context is set
    if (!backend) {
        return <div>No backend configured</div>;
    }

    // Use backend to interact with GoodData
    // ...
}
```

### Require a backend

`useBackendStrict` throws an invariant error when neither the parameter nor the context supplies a backend. Use it when a backend is required and you want a clear error instead of handling `undefined`.

```tsx
import { useBackendStrict } from "@gooddata/sdk-ui";

function MyComponent({ backend: backendProp }) {
    // Throws if no backend is available
    const backend = useBackendStrict(backendProp);

    // backend is always defined here
    const workspaces = backend.workspaces();
    // ...
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `backend` | `IAnalyticalBackend \| undefined` | Optional backend override. If provided, returned directly instead of context value. |

## Return value

- `useBackend`: `IAnalyticalBackend | undefined`
- `useBackendStrict`: `IAnalyticalBackend` (throws if unavailable)

## Notes

- The `backend` parameter takes precedence over the context value. The hook returns `backend ?? backendFromContext`.
- Without a `BackendProvider` up the tree and without the `backend` parameter, `useBackend` returns `undefined`. It doesn't throw.
- `useBackendStrict` accepts a second, optional `context: string` parameter (default `"useBackendStrict"`). It prefixes the invariant error message, so you can pass the name of the calling hook or component.
- When no backend is available, `useBackendStrict` raises an invariant error with this message: `<context>: IAnalyticalBackend must be defined. Either pass it as a parameter or make sure there is a BackendProvider up the component tree.`

## Props

{{% props %}}
