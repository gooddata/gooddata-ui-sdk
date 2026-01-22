// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ISaveAsDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function SaveAsDialog(props: ISaveAsDialogProps): ReactElement {
    const { SaveAsDialogComponent } = useDashboardComponentsContext();

    return <SaveAsDialogComponent {...props} />;
}
