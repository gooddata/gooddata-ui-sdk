---
title: Automations
sidebar_label: Automations
copyright: (C) 2007-2025 GoodData Corporation
id: automations
no_list: true
weight: 80
---

The `Automations` component lets you review and manage schedule and alert automations directly inside your GoodData applications. It handles data loading, permission checks, and bulk actions while staying configurable through props and context providers.

## Features

- Inspect automations at workspace or organization scope from a single React component
- Filter by dashboard, workspace, recipients, status, or owner depending on scope
- Sort results by title or last execution and search within the visible list
- Perform pause, resume, unsubscribe, and delete operations (single item or bulk)
- Customize visible columns, default filters, and list dimensions to fit your layout
- Plug into custom dashboard/widget routing through URL builder callbacks
- Localize UI labels and date formatting via locale and timezone props

## Basic Integration Example

```tsx
import { Automations } from "@gooddata/sdk-ui-ext";

// Import required styles
import "@gooddata/sdk-ui-ext/styles/scss/main.scss";

function WorkspaceAutomations({ backend, workspace }) {
    return <Automations backend={backend} workspace={workspace} scope="workspace" />;
}
```

Wrap the component with `BackendProvider`, `WorkspaceProvider` or `OrganizationProvider` if you prefer context-based configuration instead of passing props explicitly.

## Props

| Name                      | Type                                           | Default               | Description                                                                 |
| ------------------------- | ---------------------------------------------- | --------------------- | --------------------------------------------------------------------------- |
| backend                   | IAnalyticalBackend                             | -                     | Analytical backend instance. Falls back to `BackendProvider` context.       |
| workspace                 | string                                         | -                     | Workspace identifier. Falls back to `WorkspaceProvider` context.            |
| organization              | string                                         | -                     | Organization identifier. Falls back to `OrganizationProvider` context.      |
| scope                     | "workspace" \| "organization"                  | -                     | Chooses whether automations are limited to a workspace or span the org.     |
| locale                    | string                                         | "en-US"               | Locale used for number/date formatting and translations.                    |
| timezone                  | string                                         | "UTC"                 | Timezone used when rendering schedule timestamps.                           |
| selectedColumnDefinitions | AutomationColumnDefinitions                    | -                     | Overrides the visible column set and widths.                                |
| availableFilters          | AutomationsAvailableFilters                    | scope defaults        | Controls which filters are rendered in the header.                          |
| preselectedFilters        | AutomationsPreselectedFilters                  | {}                    | Supplies initial filter selections (e.g., status, recipients).              |
| maxHeight                 | number                                         | 500                   | Maximum table height in pixels.                                             |
| pageSize                  | number                                         | 30                    | Number of automations fetched per page.                                     |
| type                      | "schedule" \| "alert"                          | "schedule"            | Restricts the listing to a single automation type.                          |
| isSmall                   | boolean                                        | false                 | Enables a compact layout optimized for tight spaces.                        |
| invalidateItemsRef        | AutomationsInvalidateItemsRef                  | -                     | Imperative handle for refreshing the list after external changes.           |
| dashboardUrlBuilder       | IDashboardUrlBuilder                           | buildDashboardUrl     | Maps dashboard references to navigable URLs.                                |
| widgetUrlBuilder          | IWidgetUrlBuilder                              | buildWidgetUrl        | Maps widget references to navigable URLs.                                   |
| editAutomation            | (automation, workspaceId, dashboardId) => void | defaultEditAutomation | Callback used when users choose to edit an automation.                      |
| onLoad                    | AutomationsOnLoad                              | -                     | Fires after each data load with `(items, isInitial)` for telemetry or sync. |

## Filter Availability and Defaults

Filtering options depend on the selected scope. Defaults come from `defaultAvailableFilters` in `@gooddata/sdk-ui-ext`.

| Scope        | Default Filters                     |
| ------------ | ----------------------------------- |
| workspace    | `dashboard`, `recipients`, `status` |
| organization | `workspace`, `recipients`, `status` |

| Filter       | Description                                 | Workspace scope                        | Organization scope                     |
| ------------ | ------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `dashboard`  | Filter by dashboard owning the automation   | <span style="color: #0c9b4c;">✓</span> | <span style="color: #e54d42;">✗</span> |
| `workspace`  | Filter by originating workspace             | <span style="color: #e54d42;">✗</span> | <span style="color: #0c9b4c;">✓</span> |
| `recipients` | Filter by recipient (user or email)         | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `status`     | Filter by automation state (active, paused) | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `createdBy`  | Filter by automation owner                  | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |

Adjust the set with the `availableFilters` prop and pre-populate UI controls with `preselectedFilters`:

```tsx
import { Automations, defaultAvailableFilters } from "@gooddata/sdk-ui-ext";

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

## Sorting and Search

Automations support sorting by title and last run. The component exposes sort controls in the header and persists the choice via its internal state. Combine sorting with the built-in search box and filters to narrow long lists quickly.

## Column Customization

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

Columns accept optional width hints (pixels). Omit a column from this array to hide it from the list.

Default column picks are part of `defaultAvailableColumns` and mirror the filter defaults per scope:

| Scope        | Default Columns                                       |
| ------------ | ----------------------------------------------------- |
| workspace    | `title`, `dashboard`, `recipients`, `lastRun`, `menu` |
| organization | `title`, `workspace`, `recipients`, `lastRun`, `menu` |

Full column catalog:

| Column                | Description                                            | Workspace context                      | Organization context                   | Schedules                              | Alerts                                 |
| --------------------- | ------------------------------------------------------ | -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `id`                  | Automation identifier (useful for debugging)           | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `title`               | Automation name with type icon and subtitle            | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `dashboard`           | Dashboard title with navigation link                   | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `workspace`           | Workspace title                                        | <span style="color: #e54d42;">✗</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `widget`              | Widget title with navigation link                      | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `attachments`         | Export formats attached to the schedule                | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #e54d42;">✗</span> |
| `nextRun`             | Upcoming execution time                                | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #e54d42;">✗</span> |
| `recipients`          | Number of subscribed recipients with tooltip list      | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `lastRun`             | Timestamp and status icon of the most recent execution | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `lastRunStatus`       | Status text of the most recent execution               | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `state`               | Active, paused, or draft automation state              | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `createdBy`           | Creator name with email tooltip                        | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `createdAt`           | Creation timestamp                                     | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `notificationChannel` | Delivery channel (email, Slack, etc.)                  | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |
| `menu`                | Row action menu (edit, pause, unsubscribe, delete)     | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> | <span style="color: #0c9b4c;">✓</span> |

## Actions, Bulk Actions, and Callbacks

Automations bundle built-in handlers for destructive and maintenance actions such as:

- Delete single or multiple automations
- Pause or resume selected automations
- Unsubscribe users from notifications

Override the `editAutomation` callback to trigger custom edit flows (e.g., open a side panel).

After performing external updates, call `invalidateItemsRef.current?.()` to refresh the data.

## Best Practices

- Provide both `BackendProvider` and `WorkspaceProvider`/`OrganizationProvider` so the component can derive context automatically.
- Align `pageSize` with `maxHeight` to achieve optimal data loading.
- Align `locale` and `timezone` with your organization, workspace, or user settings for consistent formatting.
