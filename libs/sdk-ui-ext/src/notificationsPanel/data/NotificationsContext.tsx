// (C) 2019-2025 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { createContext, ReactNode, useContext } from "react";
import { useNotifications } from "./useNotifications.js";

/**
 * @internal
 */
export type INotificationsContext = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<INotificationsContext | null>(null);
NotificationsContext.displayName = "NotificationsContext";

/**
 * @internal
 */
export const useNotificationsContext = () => {
    const context = useContext(NotificationsContext);
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
    children?: ReactNode;
    refreshInterval: number;
    itemsPerPage: number;
    enableScheduleNotifications: boolean;
}

/**
 * @internal
 */
export function NotificationsProvider({
    children,
    backend,
    workspace,
    refreshInterval,
    itemsPerPage,
    enableScheduleNotifications,
}: INotificationsProviderProps) {
    const notifications = useNotifications({
        backend,
        workspace,
        refreshInterval,
        itemsPerPage,
        enableScheduleNotifications,
    });

    return <NotificationsContext.Provider value={notifications}>{children}</NotificationsContext.Provider>;
}
