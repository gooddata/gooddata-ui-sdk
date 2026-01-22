// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IToolbarProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function Toolbar(props: IToolbarProps): ReactElement {
    const { ToolbarComponent } = useDashboardComponentsContext();

    return <ToolbarComponent {...props} />;
}
