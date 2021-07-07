// (C) 2021 GoodData Corporation
import React from "react";

import { IDashboardDateFilterCoreProps } from "../types";

/**
 * This implementation of dashboard date filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @internal
 */
export const HiddenDashboardDateFilter: React.FC<IDashboardDateFilterCoreProps> = (_props) => {
    return null;
};
