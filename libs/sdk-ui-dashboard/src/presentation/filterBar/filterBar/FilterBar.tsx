// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type IFilterBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function FilterBar(props: IFilterBarProps): ReactElement {
    const { FilterBarComponent } = useDashboardComponentsContext();

    return <FilterBarComponent {...props} />;
}
