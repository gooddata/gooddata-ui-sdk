// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IDashboardDateFilterProps } from "./types";

// TODO throw some error ideally
const DashboardDateFilterPropsContext = createContext<IDashboardDateFilterProps>({} as any);

/**
 * @alpha
 */
export const useDashboardDateFilterProps = (): IDashboardDateFilterProps => {
    return useContext(DashboardDateFilterPropsContext);
};

/**
 * @internal
 */
export const DashboardDateFilterPropsProvider: React.FC<IDashboardDateFilterProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardDateFilterProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardDateFilterPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardDateFilterPropsContext.Provider>
    );
};
