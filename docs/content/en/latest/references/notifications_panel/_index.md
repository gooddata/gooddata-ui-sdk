---
title: Notifications Panel
sidebar_label: Notifications Panel
copyright: (C) 2007-2024 GoodData Corporation
id: notifications_panel
no_list: true
weight: 70
---

The `NotificationsPanel` is a customizable React component that provides a user interface for displaying and managing notifications within your application.

## Features

- View and manage unread and all notifications
- Mark individual notifications or all notifications as read
- Automatic notification updates at configurable intervals
- Efficient handling of large notification lists through virtual scrolling
- Fully customizable UI components
- Flexible rendering modes (inline or overlay)
- Responsive design with adjustable dimensions

## Basic Integration Example

```tsx
import { NotificationsPanel, INotificationsPanelButtonComponentProps } from "@gooddata/sdk-ui-ext";
import { isAlertNotification } from "@gooddata/sdk-model";

// Import required styles
import "@gooddata/sdk-ui-ext/styles/scss/main.scss";

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

#### Props

| Name                        | Type                                                      | Default                            | Description                                                                          |
| --------------------------- | --------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| locale                      | ILocale                                                   | "en-US"                            | Specifies the locale for internationalization                                        |
| backend                     | IAnalyticalBackend                                        | -                                  | Backend instance. Falls back to BackendProvider context if not specified             |
| workspace                   | string                                                    | -                                  | Workspace ID. Falls back to WorkspaceProvider context if not specified               |
| renderInline                | boolean                                                   | false                              | Controls whether the panel renders inline or in an overlay                           |
| maxWidth                    | number \| string                                          | 370                                | Defines the maximum width of the notifications panel (overlay mode only)             |
| maxListHeight               | number                                                    | 527                                | Defines the maximum height of the notifications list (overlay mode only)             |
| refreshInterval             | number                                                    | 600000                             | Time in milliseconds between notification refreshes. Set to 0 to disable             |
| skeletonItemsCount          | number                                                    | 5                                  | Number of placeholder items shown during loading states                              |
| itemsPerPage                | number                                                    | 50                                 | Number of notifications loaded in each batch                                         |
| itemHeight                  | number                                                    | 52                                 | Height of individual notification items in pixels                                    |
| itemsGap                    | number                                                    | 10                                 | Vertical spacing between notification items in pixels                                |
| itemPadding                 | number                                                    | 15                                 | Horizontal padding of notification items in pixels                                   |
| onNotificationClick         | (notification: INotification) => void                     | -                                  | Callback fired when a notification is clicked                                        |
| NotificationsPanelButton    | ComponentType<INotificationsPanelButtonComponentProps>    | -                                  | Button component to opens the notification panel. Required if renderInline is false. |
| NotificationsPanel          | ComponentType<INotificationsPanelComponentProps>          | DefaultNotificationsPanel          | Custom panel component                                                               |
| NotificationsPanelHeader    | ComponentType<INotificationsPanelHeaderComponentProps>    | DefaultNotificationsPanelHeader    | Custom panel header component                                                        |
| NotificationsList           | ComponentType<INotificationsListComponentProps>           | DefaultNotificationsList           | Custom notifications list component                                                  |
| NotificationsListEmptyState | ComponentType<INotificationsListEmptyStateComponentProps> | DefaultNotificationsListEmptyState | Custom notification list empty state component                                       |
| NotificationsListErrorState | ComponentType<INotificationsListErrorStateComponentProps> | DefaultNotificationsListErrorState | Custom notification list error state component                                       |
| Notification                | ComponentType<INotificationComponentProps>                | DefaultNotification                | Custom notification component                                                        |
| NotificationSkeletonItem    | ComponentType<INotificationSkeletonItemComponentProps>    | DefaultNotificationSkeletonItem    | Custom notification skeleton item component                                          |

## Customization Props

The NotificationsPanel component provides comprehensive customization options through its props.
For applications requiring specific design requirements beyond the default styling, these customization props allow you to fully adapt the panel's appearance and behavior.

> **Important**: We strongly recommend using the provided customization props and custom components for styling modifications rather than direct CSS class overrides, which may break in future updates.

The following components can be customized by providing your own implementations:

- `NotificationsPanelButton`
- `NotificationsPanel`
- `NotificationsPanelHeader`
- `NotificationsList`
- `NotificationsListEmptyState`
- `NotificationsListErrorState`
- `Notification`
- `NotificationSkeletonItem`

## Component Hierarchy

The components are organized in the following hierarchy:

```
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

Each component can be customized independently while maintaining the overall functionality of the notifications panel. When customizing components, make sure to implement all the required props to ensure proper functionality.

## Example with Custom Components and Inline Rendering

```tsx
import { NotificationsPanel } from "@gooddata/sdk-ui-ext";
import { CustomHeader, CustomNotification } from "./components";

// Import required styles
import "@gooddata/sdk-ui-ext/styles/scss/main.scss";

function MyComponent() {
    return (
        <div
            // Inline rendering adjusts dimensions according to parent container
            style={{ width: 400, height: 500 }}
        >
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

## Customizable Components

### NotificationsPanelButton

The button component that opens the notifications panel. Required and rendered only when `renderInline` is false.

#### Props

| Name                    | Type                         | Description                                         |
| ----------------------- | ---------------------------- | --------------------------------------------------- |
| buttonRef               | RefObject<HTMLButtonElement> | Reference to the button element for panel alignment |
| openNotificationPanel   | () => void                   | Function to open the panel                          |
| closeNotificationPanel  | () => void                   | Function to close the panel                         |
| toggleNotificationPanel | () => void                   | Function to toggle the panel                        |
| isNotificationPanelOpen | boolean                      | Whether the panel is currently open                 |
| hasUnreadNotifications  | boolean                      | Whether there are unread notifications              |

### NotificationsPanelHeader

The header component of the notifications panel. In the default implementation, it displays "all" / "unread" tabs and mark all as read button.

#### Props

| Name                       | Type                                    | Description                                |
| -------------------------- | --------------------------------------- | ------------------------------------------ |
| activeView                 | INotificationsPanelView                 | Current view mode ('all' or 'unread')      |
| changeActiveView           | (view: INotificationsPanelView) => void | Function to change the view mode           |
| hasUnreadNotifications     | boolean                                 | Whether there are unread notifications     |
| unreadNotificationsCount   | number                                  | Number of unread notifications             |
| markAllNotificationsAsRead | () => void                              | Function to mark all notifications as read |

### NotificationsList

The main list component that displays notifications, empty state, or error component.

#### Props

| Name                        | Type                                                            | Description                                    |
| --------------------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| NotificationsListEmptyState | React.ComponentType<INotificationsListEmptyStateComponentProps> | Component to render when list is empty         |
| NotificationsListErrorState | React.ComponentType<INotificationsListErrorStateComponentProps> | Component to render when there's an error      |
| Notification                | React.ComponentType<INotificationComponentProps>                | Component to render individual notifications   |
| NotificationSkeletonItem    | React.ComponentType<INotificationSkeletonItemComponentProps>    | Component to render loading skeleton           |
| activeView                  | INotificationsPanelView                                         | Current view mode                              |
| status                      | UseCancelablePromiseStatus                                      | Loading status                                 |
| error                       | GoodDataSdkError                                                | Error object if loading failed                 |
| activeNotifications         | INotification[]                                                 | Array of notifications to display              |
| markNotificationAsRead      | (notificationId: string) => Promise<void>                       | Function to mark a notification as read        |
| onNotificationClick         | (notification: INotification) => void                           | Function to handle notification clicks         |
| hasNextPage                 | boolean                                                         | Whether there are more notifications to load   |
| loadNextPage                | () => void                                                      | Function to load next page of notifications    |
| itemHeight                  | number                                                          | Height of each notification item               |
| itemsGap                    | number                                                          | Gap between notification items                 |
| itemPadding                 | number                                                          | Padding of notification items                  |
| skeletonItemsCount          | number                                                          | Number of skeleton items to show while loading |
| maxListHeight               | number                                                          | Maximum height of the list                     |

### NotificationsListEmptyState

Component displayed when there are no notifications.

#### Props

| Name       | Type                    | Description                           |
| ---------- | ----------------------- | ------------------------------------- |
| activeView | INotificationsPanelView | Current view mode ('all' or 'unread') |

### NotificationsListErrorState

Component displayed when there's an error loading notifications.

#### Props

| Name  | Type             | Description                                           |
| ----- | ---------------- | ----------------------------------------------------- |
| error | GoodDataSdkError | Error object containing details about what went wrong |

### Notification

Component for rendering individual notification items.

#### Props

| Name                   | Type                                  | Description                               |
| ---------------------- | ------------------------------------- | ----------------------------------------- |
| notification           | INotification                         | The notification data to display          |
| markNotificationAsRead | (id: string) => void                  | Function to mark the notification as read |
| onNotificationClick    | (notification: INotification) => void | Function to handle notification clicks    |

### NotificationSkeletonItem

Component for rendering loading placeholder items.

#### Props

| Name       | Type   | Description                           |
| ---------- | ------ | ------------------------------------- |
| itemHeight | number | Height of the skeleton item in pixels |
