// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { ITopBarProps } from "./types.js";

/**
 * @internal
 */
export const TopBar = (props: ITopBarProps): JSX.Element => {
    const { TopBarComponent } = useDashboardComponentsContext();

    return <TopBarComponent {...props} />;
};
