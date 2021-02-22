// (C) 2020 GoodData Corporation
import React from "react";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

const UserWorkspaceSettingsContext = React.createContext<IUserWorkspaceSettings | undefined>(undefined);
UserWorkspaceSettingsContext.displayName = "UserWorkspaceSettingsContext";

/**
 * @internal
 */
export interface IUserWorkspaceSettingsProviderProps {
    settings: IUserWorkspaceSettings;
}

/**
 * @internal
 */
export const UserWorkspaceSettingsProvider: React.FC<IUserWorkspaceSettingsProviderProps> = ({
    children,
    settings,
}) => {
    return (
        <UserWorkspaceSettingsContext.Provider value={settings}>
            {children}
        </UserWorkspaceSettingsContext.Provider>
    );
};

/**
 * @internal
 */
export const useUserWorkspaceSettings = (): IUserWorkspaceSettings | undefined => {
    return React.useContext(UserWorkspaceSettingsContext);
};
