// (C) 2020-2024 GoodData Corporation
import React from "react";

import { IVisualizationSwitcherToolbarProps } from "./types.js";
import { Toolbar } from "./Toolbar.js";

/**
 * @alpha
 */
export const DefaultVisualizationSwitcherToolbar = (
    props: IVisualizationSwitcherToolbarProps,
): JSX.Element => {
    return <Toolbar {...props} />;
};
