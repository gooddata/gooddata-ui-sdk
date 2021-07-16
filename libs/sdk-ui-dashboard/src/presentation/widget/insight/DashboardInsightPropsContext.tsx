// (C) 2020 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IDashboardInsightProps } from "./types";
import { useDashboardWidgetProps } from "../widget/DashboardWidgetPropsContext";

// TODO throw some error ideally
const DashboardInsightPropsContext = createContext<IDashboardInsightProps>({} as any);

/**
 * @internal
 */
export const useDashboardInsightProps = (): IDashboardInsightProps => {
    const layoutContextValue = useDashboardWidgetProps();
    const contextValue = useContext(DashboardInsightPropsContext);
    return {
        ...layoutContextValue,
        ...contextValue,
    };
};

/**
 * @internal
 */
export const DashboardInsightPropsProvider: React.FC<IDashboardInsightProps> = (props) => {
    const { children, ...restProps } = props;
    const parentContextProps = useDashboardInsightProps();

    // no need to memo, rest props is new on each render anyway
    const effectiveProps = { ...parentContextProps, ...restProps };

    return (
        <DashboardInsightPropsContext.Provider value={effectiveProps}>
            {children}
        </DashboardInsightPropsContext.Provider>
    );
};
