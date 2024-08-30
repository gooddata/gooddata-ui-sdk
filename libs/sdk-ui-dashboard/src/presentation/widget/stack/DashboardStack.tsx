// (C) 2024 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardStack = (props: any): JSX.Element => {
    const { StackWidgetComponentSet } = useDashboardComponentsContext();
    const { stack } = props;
    const StackComponent = useMemo(
        () => StackWidgetComponentSet.MainComponentProvider(stack),
        [StackWidgetComponentSet, stack],
    );

    return <StackComponent {...props} />;
};
