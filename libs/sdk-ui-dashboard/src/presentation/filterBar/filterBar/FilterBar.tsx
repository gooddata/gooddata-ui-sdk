// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IFilterBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const FilterBar = (props: IFilterBarProps): ReactElement => {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
};
