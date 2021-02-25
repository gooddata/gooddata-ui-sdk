// (C) 2020 GoodData Corporation
import React from "react";

const DashboardViewIsReadOnlyContext = React.createContext<boolean>(false);
DashboardViewIsReadOnlyContext.displayName = "DashboardViewIsReadOnlyContext";

/**
 * @internal
 */
export interface IDashboardViewIsReadOnlyProviderProps {
    isReadOnly: boolean;
}

/**
 * @internal
 */
export const DashboardViewIsReadOnlyProvider: React.FC<IDashboardViewIsReadOnlyProviderProps> = ({
    children,
    isReadOnly,
}) => {
    return (
        <DashboardViewIsReadOnlyContext.Provider value={isReadOnly}>
            {children}
        </DashboardViewIsReadOnlyContext.Provider>
    );
};

/**
 * @internal
 */
export const useDashboardViewIsReadOnly = (): boolean => {
    return React.useContext(DashboardViewIsReadOnlyContext);
};
