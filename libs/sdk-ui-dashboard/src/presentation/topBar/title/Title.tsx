// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const Title = (): JSX.Element => {
    const { TitleComponent } = useDashboardComponentsContext();

    return <TitleComponent />;
};
