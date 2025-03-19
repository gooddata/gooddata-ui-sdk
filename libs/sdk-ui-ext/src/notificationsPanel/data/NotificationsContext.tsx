// (C) 2019-2025 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useNotifications } from "./useNotifications.js";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export type INotificationsContext = ReturnType<typeof useNotifications>;

const NotificationsContext = React.createContext<INotificationsContext | null>(null);
NotificationsContext.displayName = "NotificationsContext";

/**
 * @internal
 */
export const useNotificationsContext = () => {
    const context = React.useContext(NotificationsContext);
    if (!context) {
        throw new UnexpectedSdkError("useNotificationsContext must be used within a NotificationsProvider");
    }
    return context;
};

/**
 * @internal
 */
export interface INotificationsProviderProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    children?: React.ReactNode;
    refreshInterval: number;
    itemsPerPage: number;
}

/**
 * @internal
 */
export const NotificationsProvider: React.FC<INotificationsProviderProps> = ({
    children,
    backend,
    workspace,
    refreshInterval,
    itemsPerPage,
}) => {
    const notifications = useNotifications({ backend, workspace, refreshInterval, itemsPerPage });

    return <NotificationsContext.Provider value={notifications}>{children}</NotificationsContext.Provider>;
};
