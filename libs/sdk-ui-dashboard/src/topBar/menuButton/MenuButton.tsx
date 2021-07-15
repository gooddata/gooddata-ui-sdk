// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const MenuButton = (): JSX.Element => {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent />;
};
