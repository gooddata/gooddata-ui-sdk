// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IFilterBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function FilterBar(props: IFilterBarProps): ReactElement {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
}
