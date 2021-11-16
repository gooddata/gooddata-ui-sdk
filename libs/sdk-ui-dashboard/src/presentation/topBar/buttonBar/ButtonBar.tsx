// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IButtonBarProps } from "./types";

/**
 * @internal
 */
export const ButtonBar = (props: IButtonBarProps): JSX.Element => {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent {...props} />;
};
