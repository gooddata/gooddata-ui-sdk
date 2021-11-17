// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IFilterBarProps } from "./types";

/**
 * @internal
 */
export const FilterBar = (props: IFilterBarProps): JSX.Element => {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
};
