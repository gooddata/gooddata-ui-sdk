// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IMenuButtonProps } from "./types.js";

/**
 * @internal
 */
export const MenuButton = (props: IMenuButtonProps): JSX.Element => {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent {...props} />;
};
