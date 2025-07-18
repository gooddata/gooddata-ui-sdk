// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IToolbarProps } from "./types.js";

/**
 * @internal
 */
export function Toolbar(props: IToolbarProps): ReactElement {
    const { ToolbarComponent } = useDashboardComponentsContext();

    return <ToolbarComponent {...props} />;
}
