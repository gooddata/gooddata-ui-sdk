// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { DashboardKpiProps } from "./types";
import { useDashboardWidgetProps } from "../../layout";

// TODO throw some error ideally
const DashboardKpiPropsContext = createContext<DashboardKpiProps>({} as any);

/**
 * @internal
 */
export const useDashboardKpiProps = (): DashboardKpiProps => {
    const layoutContextValue = useDashboardWidgetProps();
    const contextValue = useContext(DashboardKpiPropsContext);
    return {
        ...layoutContextValue,
        ...contextValue,
    };
};

/**
 * @internal
 */
export const DashboardKpiPropsProvider: React.FC<DashboardKpiProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardKpiProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardKpiPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardKpiPropsContext.Provider>
    );
};
