// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { ISaveAsDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function SaveAsDialog(props: ISaveAsDialogProps): ReactElement {
    const { SaveAsDialogComponent } = useDashboardComponentsContext();

    return <SaveAsDialogComponent {...props} />;
}
