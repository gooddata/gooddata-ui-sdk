// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { DashboardWidgetProps } from "./types";

// TODO throw some error ideally
const DashboardWidgetPropsContext = createContext<DashboardWidgetProps>({} as any);

/**
 * @internal
 */
export const useDashboardWidgetProps = (): DashboardWidgetProps => {
    return useContext(DashboardWidgetPropsContext);
};

/**
 * @internal
 */
export const DashboardWidgetPropsProvider: React.FC<DashboardWidgetProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardWidgetProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardWidgetPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardWidgetPropsContext.Provider>
    );
};
