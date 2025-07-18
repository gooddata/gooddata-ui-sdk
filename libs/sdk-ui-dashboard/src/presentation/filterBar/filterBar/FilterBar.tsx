// (C) 2020-2025 GoodData Corporation

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IFilterBarProps } from "./types.js";

/**
 * @internal
 */
export function FilterBar(props: IFilterBarProps) {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
}
