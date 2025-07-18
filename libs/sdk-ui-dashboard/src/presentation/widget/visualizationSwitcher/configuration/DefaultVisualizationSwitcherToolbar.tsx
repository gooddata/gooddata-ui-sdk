// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";

import { IVisualizationSwitcherToolbarProps } from "./types.js";
import { Toolbar } from "./Toolbar.js";

/**
 * @alpha
 */
export function DefaultVisualizationSwitcherToolbar(props: IVisualizationSwitcherToolbarProps): ReactElement {
    return <Toolbar {...props} />;
}
