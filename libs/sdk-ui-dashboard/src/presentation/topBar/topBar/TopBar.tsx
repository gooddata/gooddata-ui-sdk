// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { ITopBarProps } from "./types";

/**
 * @internal
 */
export const TopBar = (props: ITopBarProps): JSX.Element => {
    const { TopBarComponent } = useDashboardComponentsContext();

    return <TopBarComponent {...props} />;
};
