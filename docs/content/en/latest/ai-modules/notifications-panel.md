---
legacy_path: references/notifications_panel
title: Notifications panel
category: AI & Modules
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-ext:NotificationsPanel"
source_files:
  - src/notificationsPanel/NotificationsPanel/NotificationsPanel.tsx
props_interfaces:
  - INotificationsPanelProps
  - INotificationsPanelCustomComponentsProps
related_pages:
  - /docs/ai-modules/automations
  - /docs/dashboard-plugins/customize-automation-dialogs
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/semantic-search
type: docs
description: Display and manage notifications with NotificationsPanel, configure refresh and inline or overlay rendering, and customize the panel's individual UI elements.
weight: 57
section: AI & Modules
aliases:
  - "../references/notifications_panel/"
---

`NotificationsPanel` lists the in-app notifications of the current user, such as triggered alerts, and lets them mark notifications as read. It's exported from `@gooddata/sdk-ui-ext`.

The panel:

- shows all notifications or only the unread ones,
- marks one notification or all of them as read,
- refreshes the list at an interval you set,
- loads long lists page by page with virtual scrolling,
- renders inline or in an overlay opened by your button,
- lets you replace each of its parts with your own component.

## Basic usage

In overlay mode (the default), pass a `NotificationsPanelButton` component. The panel positions itself next to the button through `buttonRef`.

```tsx
import { NotificationsPanel, type INotificationsPanelButtonComponentProps } from "@gooddata/sdk-ui-ext";
import { isAlertNotification } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-ext/styles/css/main.css";

function NotificationsPanelButton({
    buttonRef,
    toggleNotificationPanel,
}: INotificationsPanelButtonComponentProps) {
    return (
        <button
            // Provide button ref, so notification panel can be properly positioned
            ref={buttonRef}
            onClick={toggleNotificationPanel}
        >
            Notifications
        </button>
    );
}

function Header() {
    return (
        <header>
            <nav>
                <NotificationsPanel
                    onNotificationClick={(notification) => {
                        if (isAlertNotification(notification)) {
                            const dashboardURL = notification.details.data.automation.dashboardURL;
                            window.open(dashboardURL);
                        }
                    }}
                    NotificationsPanelButton={NotificationsPanelButton}
                />
            </nav>
        </header>
    );
}
```

## Inline rendering

Set `renderInline` to render the panel in place instead of in an overlay. The panel then takes the size of its parent element, and you don't pass `NotificationsPanelButton`.

```tsx
import { NotificationsPanel } from "@gooddata/sdk-ui-ext";
import { CustomHeader, CustomNotification } from "./components";

import "@gooddata/sdk-ui-ext/styles/css/main.css";

function MyComponent() {
    return (
        <div style={{ width: 400, height: 500 }}>
            <NotificationsPanel
                NotificationsPanelHeader={CustomHeader}
                Notification={CustomNotification}
                renderInline
                refreshInterval={300000}
                onNotificationClick={(notification) => {
                    console.log("Notification clicked:", notification);
                }}
            />
        </div>
    );
}
```

## Defaults

| Prop | Default |
| --- | --- |
| `locale` | `"en-US"` |
| `renderInline` | `false` |
| `refreshInterval` | `600000` (10 minutes). `0` turns refreshing off. |
| `itemsPerPage` | `50` |
| `maxWidth` | `370` (overlay mode only) |
| `maxListHeight` | `527` (overlay mode only) |
| `itemHeight` | `52` |
| `itemsGap` | `10` |
| `itemPadding` | `15` |
| `skeletonItemsCount` | `5` |

`NotificationsPanelButton` is required when `renderInline` is `false`.

## Customizable components

To change how the panel looks, pass your own components instead of the default ones. Don't override the panel's CSS classes: they can change in any release.

The components are nested like this:

```text
NotificationsPanel
├── NotificationsPanelButton (when not inline)
└── NotificationsPanel
    ├── NotificationsPanelHeader
    └── NotificationsList
        ├── NotificationsListEmptyState (when empty)
        ├── NotificationsListErrorState (when error)
        ├── NotificationSkeletonItem (when loading)
        └── Notification (for each notification)
```

Each component can be replaced on its own. A custom component must handle the props it receives, so the panel keeps working.

| Prop | Default component | Props it receives | What it renders |
| --- | --- | --- | --- |
| `NotificationsPanelButton` | none | `INotificationsPanelButtonComponentProps` | The button that opens the panel: gets `buttonRef`, functions to open, close, or toggle the panel, and whether it's open and has unread notifications. |
| `NotificationsPanel` | `DefaultNotificationsPanel` | `INotificationsPanelComponentProps` | The panel body. |
| `NotificationsPanelHeader` | `DefaultNotificationsPanelHeader` | `INotificationsPanelHeaderComponentProps` | The header with the "All" and "Unread" tabs and the "Mark all as read" button: gets the active view, a function to change it, the unread count, and `markAllNotificationsAsRead`. |
| `NotificationsList` | `DefaultNotificationsList` | `INotificationsListComponentProps` | The list: gets the notifications, the loading status and error, paging functions, the item sizes, and the item components below. |
| `NotificationsListEmptyState` | `DefaultNotificationsListEmptyState` | `INotificationsListEmptyStateComponentProps` | The message shown when the list is empty, for the active view. |
| `NotificationsListErrorState` | `DefaultNotificationsListErrorState` | `INotificationsListErrorStateComponentProps` | The message shown when loading fails: gets the `error`. |
| `Notification` | `DefaultNotification` | `INotificationComponentProps` | One notification: gets the `notification`, `markNotificationAsRead`, and `onNotificationClick`. |
| `NotificationSkeletonItem` | `DefaultNotificationSkeletonItem` | `INotificationSkeletonItemComponentProps` | A loading placeholder: gets its `itemHeight`. |

## Props

{{% props %}}
