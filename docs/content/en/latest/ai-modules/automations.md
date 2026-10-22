---
legacy_path: references/automations
title: Automations
category: AI & Modules
diataxis_type: reference
source_files:
  - src/automations/Automations.tsx
  - src/automations/types.ts
related_pages:
  - /docs/dashboard-plugins/customize-automation-dialogs
  - /docs/ai-modules/notifications-panel
  - /docs/dashboard-plugins/dashboard
  - /docs/ai-modules/ai-assistant
type: docs
description: Embed the internal Automations list at workspace or organization scope, configure its filters and columns, and handle individual or bulk actions.
weight: 59
section: AI & Modules
aliases:
  - "../references/automations/"
---

The `Automations` component lets you review and manage schedule and alert automations directly inside your GoodData applications. It handles data loading, permission checks, and bulk actions while staying configurable through props and context providers. The list shows one automation type at a time: schedules by default, or alerts when you pass `type="alert"`.

{{% alert color="warning" title="Internal API" %}}
`Automations` and its props (`IAutomationsProps`) are `@internal` in `@gooddata/sdk-ui-ext`: they are not part of the public API, do not appear in the API reference, and may change or disappear without notice. See [API maturity](../../integrations/platform/api-maturity/) before you depend on them.
{{% /alert %}}

{{% alert color="info" title="Dashboard automation dialogs" %}}
This page covers the standalone list component. To customize the alert and scheduled email dialogs that the
Dashboard component opens, see
[Customize the alert and scheduled email dialogs](../../dashboard-plugins/customize-automation-dialogs/).
{{% /alert %}}

## Features

- Inspect automations at workspace or organization scope from a single React component
- Filter by dashboard, workspace, recipients, status, or owner depending on scope
- Sort results by title or last execution and search within the visible list
- Perform pause, resume, unsubscribe, and delete operations (single item or bulk)
- Customize visible columns, default filters, and list dimensions to fit your layout
- Plug into custom dashboard/widget routing through URL builder callbacks
- Localize UI labels and date formatting via locale and timezone props

## Basic integration example

```tsx
import { Automations } from "@gooddata/sdk-ui-ext";

// Import required styles
import "@gooddata/sdk-ui-ext/styles/css/main.css";

function WorkspaceAutomations({ backend, workspace }) {
    return <Automations backend={backend} workspace={workspace} scope="workspace" />;
}
```

Wrap the component with `BackendProvider`, `WorkspaceProvider` or `OrganizationProvider` if you prefer context-based configuration instead of passing props explicitly.

## Filter availability and defaults

Filtering options depend on the selected scope. When you omit `availableFilters`, the component uses these defaults:

| Scope        | Default filters                     |
| ------------ | ----------------------------------- |
| workspace    | `dashboard`, `recipients`, `status` |
| organization | `workspace`, `recipients`, `status` |

| Filter       | Description                                 | Workspace scope                        | Organization scope                     |
| ------------ | ------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `dashboard`  | Filter by dashboard owning the automation   | Yes | No |
| `workspace`  | Filter by originating workspace             | No | Yes |
| `recipients` | Filter by recipient (user or email)         | Yes | Yes |
| `status`     | Filter by last run status (`SUCCESS`, `FAILED`, `NEVER_RUN`) | Yes | Yes |
| `createdBy`  | Filter by automation owner                  | Yes | Yes |

Adjust the set with the `availableFilters` prop and pre-populate UI controls with `preselectedFilters`. The `preselectedFilters` keys are the filter names plus `externalRecipients`; each value is an array of `{ value, label? }` objects:

```tsx
import { Automations } from "@gooddata/sdk-ui-ext";

function OrganizationAutomations({ backend, organization }) {
    return (
        <Automations
            backend={backend}
            organization={organization}
            scope="organization"
            availableFilters={["workspace", "status"]}
            preselectedFilters={{
                status: [{ value: "FAILED", label: "Failed" }],
            }}
        />
    );
}
```

## Sorting and search

The list sorts by title (ascending by default); the title column header toggles the direction, and the component keeps the choice in its internal state. Combine sorting with the built-in search box (which matches the title) and filters to narrow long lists quickly.

## Column customization

Tailor the table layout with `selectedColumnDefinitions`:

```tsx
const customColumns = [
    { name: "title", width: 320 },
    { name: "dashboard" },
    { name: "recipients" },
    { name: "state" },
    { name: "lastRun" },
];

<Automations
    backend={backend}
    workspace={workspace}
    scope="workspace"
    selectedColumnDefinitions={customColumns}
/>;
```

Columns accept optional `width` and `minWidth` hints (pixels). Omit a column from this array to hide it from the list.

When you omit `selectedColumnDefinitions`, the component uses these defaults per scope:

| Scope        | Default columns                                       |
| ------------ | ----------------------------------------------------- |
| workspace    | `title`, `dashboard`, `recipients`, `lastRun`, `menu` |
| organization | `title`, `workspace`, `recipients`, `lastRun`, `menu` |

Every column is available in both scopes; the `workspace` column is only useful at organization scope. Columns marked schedule-only (`attachments`, `nextRun`) have no value for alerts:

| Column                | Description                                            | Schedules                              | Alerts                                 |
| --------------------- | ------------------------------------------------------ | -------------------------------------- | -------------------------------------- |
| `id`                  | Automation identifier (useful for debugging)           | Yes | Yes |
| `title`               | Automation name with type icon and subtitle            | Yes | Yes |
| `dashboard`           | Dashboard title with navigation link                   | Yes | Yes |
| `workspace`           | Workspace title                                        | Yes | Yes |
| `widget`              | Widget title with navigation link                      | Yes | Yes |
| `attachments`         | Export formats attached to the schedule                | Yes | No |
| `nextRun`             | Upcoming execution time                                | Yes | No |
| `recipients`          | Number of subscribed recipients with tooltip list      | Yes | Yes |
| `lastRun`             | Timestamp and status icon of the most recent execution | Yes | Yes |
| `lastRunStatus`       | Status text of the most recent execution               | Yes | Yes |
| `state`               | Active, paused, or draft automation state              | Yes | Yes |
| `createdBy`           | Creator name with email tooltip                        | Yes | Yes |
| `createdAt`           | Creation timestamp                                     | Yes | Yes |
| `notificationChannel` | Delivery channel (email, Slack, etc.)                  | Yes | Yes |
| `menu`                | Row action menu (edit, pause, unsubscribe, delete)     | Yes | Yes |

## Actions, bulk actions, and callbacks

Automations bundle built-in handlers for destructive and maintenance actions such as:

- Delete single or multiple automations
- Pause or resume selected automations
- Unsubscribe users from notifications

Override the `editAutomation` callback to trigger custom edit flows (for example, open a side panel).

To refresh the list after external updates, increment the `externalInvalidationId` prop. The component ignores `0` or `undefined`, so start at `0` and increment when a reload is needed:

```tsx
const [invalidationId, setInvalidationId] = useState(0);

// After external update (for example, delete via API)
setInvalidationId(invalidationId + 1);

<Automations
    backend={backend}
    workspace={workspace}
    scope="workspace"
    externalInvalidationId={invalidationId}
/>;
```

## Notes

- Provide both `BackendProvider` and `WorkspaceProvider`/`OrganizationProvider` so the component can derive context automatically.
- Align `pageSize` (default 30) with `maxHeight` (default 500 pixels) so a page of rows fills the visible area.
- Set `locale` (default `en-US`) and `timezone` (default `UTC`) to match your organization, workspace, or user settings for consistent formatting.
- `Automations` is `@internal`, so its props are not published in the API reference. For the current list of props and defaults, see `IAutomationsProps` in the `@gooddata/sdk-ui-ext` source, under `src/automations/types.ts`.
