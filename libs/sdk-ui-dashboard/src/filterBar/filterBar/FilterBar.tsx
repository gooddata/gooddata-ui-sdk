// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const FilterBar = (): JSX.Element => {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent />;
};
