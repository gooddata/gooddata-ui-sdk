// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IDashboardAttributeFilterProps } from "./types";

// TODO throw some error ideally
const DashboardAttributeFilterPropsContext = createContext<IDashboardAttributeFilterProps>({} as any);

/**
 * @alpha
 */
export const useDashboardAttributeFilterProps = (): IDashboardAttributeFilterProps => {
    return useContext(DashboardAttributeFilterPropsContext);
};

/**
 * @internal
 */
export const DashboardAttributeFilterPropsProvider: React.FC<IDashboardAttributeFilterProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardAttributeFilterProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardAttributeFilterPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardAttributeFilterPropsContext.Provider>
    );
};
