// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IButtonBarProps } from "./types.js";

/**
 * @internal
 */
export const ButtonBar = (props: IButtonBarProps): JSX.Element => {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent {...props} />;
};
