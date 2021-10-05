// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IDashboardInsightMenuButtonProps } from "./types";

// TODO throw some error ideally
const DashboardInsightMenuButtonPropsContext = createContext<IDashboardInsightMenuButtonProps>({} as any);

/**
 * @internal
 */
export const useDashboardInsightMenuButtonProps = (): IDashboardInsightMenuButtonProps => {
    return useContext(DashboardInsightMenuButtonPropsContext);
};

/**
 * @internal
 */
export const DashboardInsightMenuButtonPropsProvider: React.FC<IDashboardInsightMenuButtonProps> = (
    props,
) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardInsightMenuButtonProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardInsightMenuButtonPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardInsightMenuButtonPropsContext.Provider>
    );
};
