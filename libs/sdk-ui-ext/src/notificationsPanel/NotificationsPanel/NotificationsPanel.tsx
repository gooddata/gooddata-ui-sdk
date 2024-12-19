// (C) 2024 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ILocale } from "@gooddata/sdk-ui";
import { assertNever, INotification } from "@gooddata/sdk-model";
import { NotificationsProvider, useNotificationsContext } from "../data/NotificationsContext.js";
import { OrganizationProvider } from "../@staging/OrganizationContext/OrganizationContext.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { INotificationsPanelView } from "../types.js";
import {
    INotificationsPanelHeaderComponentProps,
    DefaultNotificationsPanelHeader,
} from "./DefaultNotificationsPanelHeader.js";
import { IOpenNotificationsPanelButtonComponentProps } from "./DefaultOpenNotificationsPanelButton.js";
import { DefaultNotificationsPanel, INotificationsPanelComponentProps } from "./DefaultNotificationsPanel.js";
import { Overlay, alignConfigToAlignPoint } from "@gooddata/sdk-ui-kit";
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

const ALIGN_POINTS = [
    alignConfigToAlignPoint({ triggerAlignPoint: "bottom-right", overlayAlignPoint: "top-right" }),
];

/**
 * @alpha
 */
export interface INotificationsPanelCustomComponentsProps {
    /**
     * Custom open notifications panel button component.
     */
    OpenNotificationsPanelButton: React.ComponentType<IOpenNotificationsPanelButtonComponentProps>;

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
}

/**
 * @alpha
 */
export interface INotificationsPanelProps extends INotificationsPanelCustomComponentsProps {
    /**
     * Backend to use.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace ID to use.
     */
    workspace?: string;

    /**
     * Refresh interval in milliseconds.
     * Default is 10 minutes.
     * If set to 0, notifications will not be refreshed automatically.
     */
    refreshInterval?: number;

    /**
     * Locale to use.
     */
    locale?: ILocale;

    /**
     * Render notifications panel inline (without button + clicking on it).
     */
    renderInline?: boolean;

    /**
     * Handler for notification click.
     */
    onNotificationClick: (notification: INotification) => void;
}

/**
 * 10 minutes in milliseconds.
 */
const TEN_MINUTES = 1000 * 60 * 10;

/**
 * @alpha
 */
export function NotificationsPanel(props: INotificationsPanelProps) {
    const { locale, refreshInterval = TEN_MINUTES, backend, workspace } = props;

    return (
        <OrganizationProvider>
            <NotificationsProvider backend={backend} workspace={workspace} refreshInterval={refreshInterval}>
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
    OpenNotificationsPanelButton,
    NotificationsPanel = DefaultNotificationsPanel,
    NotificationsPanelHeader = DefaultNotificationsPanelHeader,
    NotificationsList = DefaultNotificationsList,
    NotificationsListEmptyState = DefaultNotificationsListEmptyState,
    NotificationsListErrorState = DefaultNotificationsListErrorState,
    Notification = DefaultNotification,
    onNotificationClick,
    renderInline = false,
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
        activeNotifications,
        //
        status,
        error,
        loadNextPage,
        hasNextPage,
    } = useNotificationsPanelController();

    const handleNotificationClick = useCallback(
        (notification: INotification) => {
            markNotificationAsRead(notification.id);
            closeNotificationsPanel();
            onNotificationClick?.(notification);
        },
        [markNotificationAsRead, closeNotificationsPanel, onNotificationClick],
    );

    return (
        <>
            {renderInline ? (
                <NotificationsPanel
                    NotificationsPanelHeader={NotificationsPanelHeader}
                    NotificationsList={NotificationsList}
                    NotificationsListEmptyState={NotificationsListEmptyState}
                    NotificationsListErrorState={NotificationsListErrorState}
                    Notification={Notification}
                    toggleNotificationsPanel={toggleNotificationsPanel}
                    openNotificationsPanel={openNotificationsPanel}
                    closeNotificationsPanel={closeNotificationsPanel}
                    activeView={activeView}
                    changeActiveView={changeActiveView}
                    markNotificationAsRead={markNotificationAsRead}
                    markAllNotificationsAsRead={markAllNotificationsAsRead}
                    unreadNotificationsCount={unreadNotificationsCount}
                    activeNotifications={activeNotifications}
                    onNotificationClick={handleNotificationClick}
                    status={status}
                    error={error}
                    loadNextPage={loadNextPage}
                    hasNextPage={hasNextPage}
                />
            ) : (
                <>
                    <OpenNotificationsPanelButton
                        buttonRef={buttonRef}
                        isNotificationPanelOpen={isOpen}
                        toggleNotificationPanel={toggleNotificationsPanel}
                        openNotificationPanel={openNotificationsPanel}
                        closeNotificationPanel={closeNotificationsPanel}
                        hasUnreadNotifications={unreadNotificationsCount > 0}
                    />
                    {isOpen ? (
                        <Overlay
                            className="gd-ui-ext-notifications-panel-overlay"
                            isModal={false}
                            alignTo={buttonRef.current}
                            alignPoints={ALIGN_POINTS}
                            closeOnEscape
                            closeOnOutsideClick
                            closeOnParentScroll={false}
                            closeOnMouseDrag={false}
                            onClose={closeNotificationsPanel}
                        >
                            <NotificationsPanel
                                NotificationsPanelHeader={NotificationsPanelHeader}
                                NotificationsList={NotificationsList}
                                NotificationsListEmptyState={NotificationsListEmptyState}
                                NotificationsListErrorState={NotificationsListErrorState}
                                Notification={Notification}
                                toggleNotificationsPanel={toggleNotificationsPanel}
                                openNotificationsPanel={openNotificationsPanel}
                                closeNotificationsPanel={closeNotificationsPanel}
                                activeView={activeView}
                                changeActiveView={changeActiveView}
                                markNotificationAsRead={markNotificationAsRead}
                                markAllNotificationsAsRead={markAllNotificationsAsRead}
                                unreadNotificationsCount={unreadNotificationsCount}
                                activeNotifications={activeNotifications}
                                onNotificationClick={handleNotificationClick}
                                status={status}
                                error={error}
                                loadNextPage={loadNextPage}
                                hasNextPage={hasNextPage}
                            />
                        </Overlay>
                    ) : null}
                </>
            )}
        </>
    );
}

function useNotificationsPanelController() {
    const [isOpen, setIsOpen] = useState(false);
    const openNotificationsPanel = useCallback(() => setIsOpen(true), []);
    const closeNotificationsPanel = useCallback(() => setIsOpen(false), []);
    const toggleNotificationsPanel = useCallback(() => setIsOpen((x) => !x), []);

    //

    const changeActiveView = useCallback((view: INotificationsPanelView) => setActiveView(view), []);
    const [activeView, setActiveView] = useState<INotificationsPanelView>("unread");

    const buttonRef = useRef<HTMLElement>(null);

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
        unreadNotificationsCount,
        activeNotifications,
        //
        status,
        error,
        loadNextPage,
        hasNextPage,
    };
}
