// (C) 2021 GoodData Corporation
import { IFilterBarProps } from "./types.js";

/**
 * This implementation of Filter Bar will ensure that all the filter controls are out of sight. All the dashboard
 * filtering is still in place however user cannot see or interact with the filters.
 *
 * @alpha
 */
export const HiddenFilterBar = (_props: IFilterBarProps): JSX.Element | null => {
    return null;
};
