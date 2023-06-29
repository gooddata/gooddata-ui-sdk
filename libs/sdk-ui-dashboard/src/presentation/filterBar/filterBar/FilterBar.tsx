// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IFilterBarProps } from "./types.js";

/**
 * @internal
 */
export const FilterBar = (props: IFilterBarProps): JSX.Element => {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
};
