// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { Toolbar } from "./Toolbar.js";
import { type IVisualizationSwitcherToolbarProps } from "./types.js";

/**
 * @alpha
 */
export function DefaultVisualizationSwitcherToolbar(props: IVisualizationSwitcherToolbarProps): ReactElement {
    return <Toolbar {...props} />;
}
