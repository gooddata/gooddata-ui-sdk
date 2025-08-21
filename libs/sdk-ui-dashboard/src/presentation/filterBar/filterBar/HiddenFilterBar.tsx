// (C) 2021-2025 GoodData Corporation
import { ReactElement } from "react";

import { IFilterBarProps } from "./types.js";

/**
 * This implementation of Filter Bar will ensure that all the filter controls are out of sight. All the dashboard
 * filtering is still in place however user cannot see or interact with the filters.
 *
 * @alpha
 */
export function HiddenFilterBar(_props: IFilterBarProps): ReactElement | null {
    return null;
}
