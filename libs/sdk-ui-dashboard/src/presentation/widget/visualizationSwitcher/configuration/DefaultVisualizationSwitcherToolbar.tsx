// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IVisualizationSwitcherToolbarProps } from "./types.js";
import { Toolbar } from "./Toolbar.js";

/**
 * @alpha
 */
export const DefaultVisualizationSwitcherToolbar = (
    props: IVisualizationSwitcherToolbarProps,
): ReactElement => {
    return <Toolbar {...props} />;
};
