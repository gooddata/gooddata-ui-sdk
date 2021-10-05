// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IDashboardInsightMenuProps } from "./types";

// TODO throw some error ideally
const DashboardInsightMenuPropsContext = createContext<IDashboardInsightMenuProps>({} as any);

/**
 * @internal
 */
export const useDashboardInsightMenuProps = (): IDashboardInsightMenuProps => {
    return useContext(DashboardInsightMenuPropsContext);
};

/**
 * @internal
 */
export const DashboardInsightMenuPropsProvider: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardInsightMenuProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardInsightMenuPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardInsightMenuPropsContext.Provider>
    );
};
