// (C) 2021 GoodData Corporation
import React from "react";

import { IFilterBarCoreProps } from "./types";

/**
 * This implementation of Filter Bar will ensure that all the filter controls are out of sight. All the dashboard
 * filtering is still in place however user cannot see or interact with the filters.
 *
 * @internal
 */
export const HiddenFilterBar: React.FC<IFilterBarCoreProps> = (_props) => {
    return null;
};
