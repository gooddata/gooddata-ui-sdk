// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IFilterBarProps } from "./types.js";

/**
 * @internal
 */
export const FilterBar = (props: IFilterBarProps): ReactElement => {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
};
