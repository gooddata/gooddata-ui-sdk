// (C) 2021 GoodData Corporation
import React from "react";
import { IDashboardAttributeFilterCoreProps } from "../types";

/**
 * This implementation of dashboard attribute filter keeps the filter hidden out of sight. The attribute filter itself
 * will still be in effect.
 *
 * @internal
 */
export const HiddenDashboardAttributeFilter: React.FC<IDashboardAttributeFilterCoreProps> = (_props) => {
    return null;
};
