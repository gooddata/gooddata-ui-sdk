// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { DashboardLayoutProps } from "./types";

// TODO throw some error ideally
const DashboardLayoutPropsContext = createContext<DashboardLayoutProps>({} as any);

/**
 * @alpha
 */
export const useDashboardLayoutProps = (): DashboardLayoutProps => {
    return useContext(DashboardLayoutPropsContext);
};

/**
 * @internal
 */
export const DashboardLayoutPropsProvider: React.FC<DashboardLayoutProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardLayoutProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardLayoutPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardLayoutPropsContext.Provider>
    );
};
