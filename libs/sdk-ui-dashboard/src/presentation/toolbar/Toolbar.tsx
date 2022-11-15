// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";
import { IToolbarProps } from "./types";

/**
 * @internal
 */
export const Toolbar = (props: IToolbarProps): JSX.Element => {
    const { ToolbarComponent } = useDashboardComponentsContext();

    return <ToolbarComponent {...props} />;
};
