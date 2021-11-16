// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IMenuButtonProps } from "./types";

/**
 * @internal
 */
export const MenuButton = (props: IMenuButtonProps): JSX.Element => {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent {...props} />;
};
