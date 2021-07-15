// (C) 2020 GoodData Corporation
import React from "react";
import { IExecutionConfig } from "@gooddata/sdk-model";

const DashboardViewExecConfigContext = React.createContext<IExecutionConfig | undefined>(undefined);
DashboardViewExecConfigContext.displayName = "DashboardViewConfigContext";

/**
 * @internal
 */
export interface IDashboardViewExecConfigProviderProps {
    execConfig: IExecutionConfig;
}

/**
 * @internal
 */
export const DashboardViewExecConfigProvider: React.FC<IDashboardViewExecConfigProviderProps> = ({
    children,
    execConfig,
}) => {
    return (
        <DashboardViewExecConfigContext.Provider value={execConfig}>
            {children}
        </DashboardViewExecConfigContext.Provider>
    );
};

/**
 * @internal
 */
export const useDashboardViewExecConfig = (): IExecutionConfig | undefined => {
    return React.useContext(DashboardViewExecConfigContext);
};
