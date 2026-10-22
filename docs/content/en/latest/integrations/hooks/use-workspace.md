---
title: useWorkspace
category: Integrations / Hooks
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useWorkspace"
  - "@gooddata/sdk-ui:useWorkspaceStrict"
source_files:
  - src/base/react/WorkspaceContext.tsx
related_pages:
  - /docs/integrations/hooks/use-backend
  - /docs/integrations/hooks/use-organization
  - /docs/integrations/backend-setup
  - /docs/data-layer/data-model/workspace-catalog
description: Read the workspace identifier from WorkspaceProvider context, with an optional override and a strict variant that throws when unset.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 97
section: Integrations
subsection: Hooks
---

`useWorkspace` returns the workspace identifier provided to `WorkspaceProvider`. If you pass a workspace identifier, the hook returns it instead, so a component can accept a `workspace` prop that wins over the context. `useWorkspaceStrict` does the same but throws when no workspace is available.

## Basic usage

```tsx
import { useWorkspace } from "@gooddata/sdk-ui";

function MyComponent({ workspace: workspaceProp }: { workspace?: string }) {
    // Uses workspaceProp if defined, otherwise falls back to the context value
    const workspace = useWorkspace(workspaceProp);

    if (!workspace) {
        return <div>No workspace configured</div>;
    }

    // Use the workspace identifier for data fetching
    // ...
}
```

### Require a workspace

Use `useWorkspaceStrict` in components that can't work without a workspace. It throws an invariant error when neither the parameter nor the context supplies one, so a misconfigured provider tree fails early:

```tsx
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

function MyComponent({ workspace: workspaceProp }: { workspace?: string }) {
    // Throws if no workspace is available
    const workspace = useWorkspaceStrict(workspaceProp);

    // workspace is always a string here
    // ...
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `workspace` | `string \| undefined` | Optional workspace override. If defined, the hook returns it instead of the context value. |
| `context` | `string` | `useWorkspaceStrict` only. Optional prefix of the error message, `"useWorkspaceStrict"` by default. Pass the name of the calling hook or component. |

## Return value

- `useWorkspace`: `string | undefined`
- `useWorkspaceStrict`: `string` (throws if unavailable)

## Notes

- The override wins only when it's defined. Passing `undefined` is the same as passing nothing.
- Components re-render when `WorkspaceProvider` receives a new `workspace` value, so hooks that key cached data on the workspace pick up the change.
- When no workspace is available, `useWorkspaceStrict` throws with this message: `<context>: workspace must be defined. Either pass it as a parameter or make sure there is a WorkspaceProvider up the component tree.`
