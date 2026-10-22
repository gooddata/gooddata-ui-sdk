---
title: useOrganization
category: Integrations / Hooks
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useOrganization"
source_files:
  - src/base/react/OrganizationContext.tsx
related_pages:
  - /docs/integrations/hooks/use-backend
  - /docs/integrations/hooks/use-workspace
  - /docs/ai-modules/automations
description: Read the organization identifier supplied to OrganizationProvider, returning the id string or undefined if unset.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 98
section: Integrations
subsection: Hooks
---

`useOrganization` returns the organization identifier provided to `OrganizationProvider`. Use it to reach organization-level services, such as organization settings or users, through `backend.organization(id)`.

## Basic usage

```tsx
import { useBackendStrict, useOrganization } from "@gooddata/sdk-ui";

function MyComponent() {
    const backend = useBackendStrict();
    const organization = useOrganization();

    if (!organization) {
        return <div>No organization configured</div>;
    }

    // Access organization-level services
    const orgService = backend.organization(organization);
    // ...
}
```

## Parameters

None.

## Return value

`string | undefined`: the organization identifier, or `undefined` when no `OrganizationProvider` up the tree sets one.

## Notes

- Components re-render when `OrganizationProvider` receives a new `organization` value.
- There is no strict variant. If your code can't work without an organization, check for `undefined` and render a fallback or throw, as in the example.
- The hook only returns the identifier; it makes no backend call. Combine it with a backend, for example from [`useBackendStrict`](../use-backend/), to load organization resources.
