// (C) 2024-2025 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ILocale } from "@gooddata/sdk-ui";
import { assertNever, INotification } from "@gooddata/sdk-model";
import { Overlay, alignConfigToAlignPoint, UiFocusTrap } from "@gooddata/sdk-ui-kit";
import { invariant } from "ts-invariant";
import { NotificationsProvider, useNotificationsContext } from "../data/NotificationsContext.js";
import { OrganizationProvider } from "../@staging/OrganizationContext/OrganizationContext.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { INotificationsPanelView } from "../types.js";
import {
    INotificationsPanelHeaderComponentProps,
    DefaultNotificationsPanelHeader,
} from "./DefaultNotificationsPanelHeader.js";
import { INotificationsPanelButtonComponentProps } from "./DefaultNotificationsPanelButton.js";
import { DefaultNotificationsPanel, INotificationsPanelComponentProps } from "./DefaultNotificationsPanel.js";
import {
    DefaultNotificationsList,
    INotificationsListComponentProps,
} from "../NotificationsList/DefaultNotificationsList.js";
import {
    DefaultNotificationsListEmptyState,
    INotificationsListEmptyStateComponentProps,
} from "../NotificationsList/DefaultNotificationsListEmptyState.js";
import {
    DefaultNotificationsListErrorState,
    INotificationsListErrorStateComponentProps,
} from "../NotificationsList/DefaultNotificationsListErrorState.js";
import { DefaultNotification, INotificationComponentProps } from "../Notification/DefaultNotification.js";
import {
    DefaultNotificationSkeletonItem,
    INotificationSkeletonItemComponentProps,
} from "../NotificationsList/DefaultSkeletonItem.js";

const ALIGN_POINTS = [
    alignConfigToAlignPoint({ triggerAlignPoint: "bottom-right", overlayAlignPoint: "top-right" }),
    alignConfigToAlignPoint({ triggerAlignPoint: "bottom-left", overlayAlignPoint: "top-left" }),
    alignConfigToAlignPoint({ triggerAlignPoint: "top-right", overlayAlignPoint: "bottom-right" }),
    alignConfigToAlignPoint({ triggerAlignPoint: "top-left", overlayAlignPoint: "bottom-left" }),
];

/**
 * @public
 */
export interface INotificationsPanelCustomComponentsProps {
    /**
     * Custom open notifications panel button component.
     *
     * - Required if renderInline is not enabled.
     */
    NotificationsPanelButton?: React.ComponentType<INotificationsPanelButtonComponentProps>;

    /**
     * Custom notifications panel component.
     */
    NotificationsPanel?: React.ComponentType<INotificationsPanelComponentProps>;

    /**
     * Custom notifications panel header component.
     */
    NotificationsPanelHeader?: React.ComponentType<INotificationsPanelHeaderComponentProps>;

    /**
     * Custom notifications list component.
     */
    NotificationsList?: React.ComponentType<INotificationsListComponentProps>;

    /**
     * Custom notifications list empty state component.
     */
    NotificationsListEmptyState?: React.ComponentType<INotificationsListEmptyStateComponentProps>;

    /**
     * Custom notifications list error state component.
     */
    NotificationsListErrorState?: React.ComponentType<INotificationsListErrorStateComponentProps>;

    /**
     * Custom notification component.
     */
    Notification?: React.ComponentType<INotificationComponentProps>;

    /**
     * Custom notification skeleton item component.
     */
    NotificationSkeletonItem?: React.ComponentType<INotificationSkeletonItemComponentProps>;
}

/**
 * @public
 */
export interface INotificationsPanelProps extends INotificationsPanelCustomComponentsProps {
    /**
     * Locale to use.
     */
    locale?: ILocale;

    /**
     * Backend to use.
     *
     * - If not defined, the backend from the BackendProvider context will be used.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace ID to use.
     *
     * - If not defined, the workspace ID from the WorkspaceProvider context will be used.
     * - If workspace is not defined and there is no WorkspaceProvider, notifications will be loaded from all workspaces.
     */
    workspace?: string;

    /**
     * Enable inline rendering of the notifications panel
     *
     * - Default: false
     * - If enabled, NotificationsPanelButton won't be rendered, and NotificationsPanel won't be rendered inside modal
     * - This is useful when you want to render notifications panel in a custom modal.
     */
    renderInline?: boolean;

    /**
     * Refresh interval in milliseconds.
     *
     * - Default: 600000 (10 minutes)
     * - If set to 0, notifications won't be refreshed automatically.
     */
    refreshInterval?: number;

    /**
     * Number of notifications to load per page.
     *
     * - Default: 50
     */
    itemsPerPage?: number;

    /**
     * Number of skeleton items to render when loading notifications.
     *
     * - Default: 5
     */
    skeletonItemsCount?: number;

    /**
     * Height of the item in notifications list in pixels.
     *
     * - Default: 52
     */
    itemHeight?: number;

    /**
     * Optionally override max width of the notifications panel.
     *
     * - Does not have effect when renderInline is true - inline rendering always fills the parent container.
     */
    maxWidth?: number | string;

    /**
     * Maximum height of the notifications list in pixels.
     *
     * - Default: 527
     * - Does not have effect when renderInline is true - inline rendering always fills the parent container.
     */
    maxListHeight?: number;

    /**
     * Gap between notification items in the list in pixels.
     *
     * - Default: 10
     */
    itemsGap?: number;

    /**
     * Padding of the notification item (from left and right) in pixels.
     *
     * - Default: 15
     */
    itemPadding?: number;

    /**
     * Callback for notification click.
     */
    onNotificationClick?: (notification: INotification) => void;
}

/**
 * 10 minutes in milliseconds.
 */
const TEN_MINUTES = 1000 * 60 * 10;

/**
 * @public
 */
export function NotificationsPanel(props: INotificationsPanelProps) {
    const { locale, refreshInterval = TEN_MINUTES, itemsPerPage = 50, backend, workspace } = props;

    return (
        <OrganizationProvider>
            <NotificationsProvider
                backend={backend}
                workspace={workspace}
                refreshInterval={refreshInterval}
                itemsPerPage={itemsPerPage}
            >
                <IntlWrapper locale={locale}>
                    <NotificationsPanelController {...props} />
                </IntlWrapper>
            </NotificationsProvider>
        </OrganizationProvider>
    );
}

/**
 * @internal
 */
function NotificationsPanelController({
    NotificationsPanelButton,
    NotificationsPanel = DefaultNotificationsPanel,
    NotificationsPanelHeader = DefaultNotificationsPanelHeader,
    NotificationsList = DefaultNotificationsList,
    NotificationsListEmptyState = DefaultNotificationsListEmptyState,
    NotificationsListErrorState = DefaultNotificationsListErrorState,
    Notification = DefaultNotification,
    NotificationSkeletonItem = DefaultNotificationSkeletonItem,
    onNotificationClick,
    renderInline = false,
    itemHeight = 52,
    maxWidth = 370,
    maxListHeight = 527,
    itemsGap = 10,
    itemPadding = 15,
    skeletonItemsCount = 5,
}: INotificationsPanelProps) {
    const {
        buttonRef,
        isOpen,
        openNotificationsPanel,
        closeNotificationsPanel,
        toggleNotificationsPanel,
        //
        activeView,
        changeActiveView,
        //
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        hasUnreadNotifications,
        activeNotifications,
        //
        status,
        error,
        loadNextPage,
        hasNextPage,
    } = useNotificationsPanelController();

    const handleNotificationClick = useCallback(
        (notification: INotification) => {
            if (!notification.isRead) {
                markNotificationAsRead(notification.id);
            }
            closeNotificationsPanel();
            onNotificationClick?.(notification);
        },
        [markNotificationAsRead, closeNotificationsPanel, onNotificationClick],
    );

    const notificationsPanel = (
        <UiFocusTrap returnFocusTo={buttonRef}>
            <NotificationsPanel
                NotificationsPanelHeader={NotificationsPanelHeader}
                NotificationsList={NotificationsList}
                NotificationsListEmptyState={NotificationsListEmptyState}
                NotificationsListErrorState={NotificationsListErrorState}
                Notification={Notification}
                NotificationSkeletonItem={NotificationSkeletonItem}
                toggleNotificationsPanel={toggleNotificationsPanel}
                openNotificationsPanel={openNotificationsPanel}
                closeNotificationsPanel={closeNotificationsPanel}
                activeView={activeView}
                changeActiveView={changeActiveView}
                markNotificationAsRead={markNotificationAsRead}
                markAllNotificationsAsRead={markAllNotificationsAsRead}
                unreadNotificationsCount={unreadNotificationsCount}
                hasUnreadNotifications={hasUnreadNotifications}
                activeNotifications={activeNotifications}
                onNotificationClick={handleNotificationClick}
                status={status}
                error={error}
                loadNextPage={loadNextPage}
                hasNextPage={hasNextPage}
                itemHeight={itemHeight}
                itemsGap={itemsGap}
                itemPadding={itemPadding}
                skeletonItemsCount={skeletonItemsCount}
                maxListHeight={renderInline ? undefined : maxListHeight}
            />
        </UiFocusTrap>
    );

    if (renderInline) {
        return notificationsPanel;
    }

    invariant(
        NotificationsPanelButton,
        "If renderInline is not enabled, NotificationsPanelButton is required.",
    );

    return (
        <>
            <NotificationsPanelButton
                buttonRef={buttonRef}
                isNotificationPanelOpen={isOpen}
                toggleNotificationPanel={toggleNotificationsPanel}
                openNotificationPanel={openNotificationsPanel}
                closeNotificationPanel={closeNotificationsPanel}
                hasUnreadNotifications={hasUnreadNotifications}
            />
            {isOpen ? (
                <Overlay
                    isModal={false}
                    alignTo={buttonRef.current}
                    alignPoints={ALIGN_POINTS}
                    closeOnEscape
                    closeOnOutsideClick
                    closeOnParentScroll={false}
                    closeOnMouseDrag={false}
                    onClose={closeNotificationsPanel}
                    width="100%"
                    maxWidth={maxWidth}
                >
                    {notificationsPanel}
                </Overlay>
            ) : null}
        </>
    );
}

function useNotificationsPanelController() {
    const [isOpen, setIsOpen] = useState(false);
    const openNotificationsPanel = useCallback(() => setIsOpen(true), []);
    const closeNotificationsPanel = useCallback(() => setIsOpen(false), []);
    const toggleNotificationsPanel = useCallback(() => setIsOpen((x) => !x), []);

    const changeActiveView = useCallback((view: INotificationsPanelView) => setActiveView(view), []);
    const [activeView, setActiveView] = useState<INotificationsPanelView>("unread");

    const buttonRef = useRef<HTMLButtonElement>(null);

    const {
        notifications,
        unreadNotifications,
        unreadNotificationsCount,
        unreadNotificationsHasNextPage,
        unreadNotificationsLoadNextPage,
        unreadNotificationsStatus,
        unreadNotificationsError,
        notificationsHasNextPage,
        notificationsLoadNextPage,
        notificationsStatus,
        notificationsError,
        markAllNotificationsAsRead,
        markNotificationAsRead,
    } = useNotificationsContext();

    const activeNotifications = useMemo(() => {
        switch (activeView) {
            case "unread":
                return unreadNotifications;
            case "all":
                return notifications;
            default:
                assertNever(activeView);
                return [];
        }
    }, [activeView, unreadNotifications, notifications]);

    const status = activeView === "unread" ? unreadNotificationsStatus : notificationsStatus;

    const error = activeView === "unread" ? unreadNotificationsError : notificationsError;

    const loadNextPage =
        activeView === "unread" ? unreadNotificationsLoadNextPage : notificationsLoadNextPage;

    const hasNextPage = activeView === "unread" ? unreadNotificationsHasNextPage : notificationsHasNextPage;

    const hasUnreadNotifications = unreadNotificationsCount > 0;

    return {
        buttonRef,
        isOpen,
        openNotificationsPanel,
        closeNotificationsPanel,
        toggleNotificationsPanel,
        //
        activeView,
        changeActiveView,
        //
        markNotificationAsRead,
        markAllNotificationsAsRead,
        hasUnreadNotifications,
        unreadNotificationsCount,
        activeNotifications,
        //
        status,
        error,
        loadNextPage,
        hasNextPage,
    };
}
