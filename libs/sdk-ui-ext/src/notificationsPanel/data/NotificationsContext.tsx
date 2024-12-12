// (C) 2019-2024 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useNotifications } from "./useNotifications.js";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";

export type INotificationsContext = ReturnType<typeof useNotifications>;

const NotificationsContext = React.createContext<INotificationsContext | null>(null);
NotificationsContext.displayName = "NotificationsContext";

export const useNotificationsContext = () => {
    const context = React.useContext(NotificationsContext);
    if (!context) {
        throw new UnexpectedSdkError("useNotificationsContext must be used within a NotificationsProvider");
    }
    return context;
};

export interface INotificationsProviderProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    children?: React.ReactNode;
}

export const NotificationsProvider: React.FC<INotificationsProviderProps> = ({
    children,
    backend,
    workspace,
}) => {
    const notifications = useNotifications({ backend, workspace });

    return <NotificationsContext.Provider value={notifications}>{children}</NotificationsContext.Provider>;
};
