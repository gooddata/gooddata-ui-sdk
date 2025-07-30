// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { ISaveAsDialogProps } from "./types.js";

/**
 * @internal
 */
export const SaveAsDialog = (props: ISaveAsDialogProps): ReactElement => {
    const { SaveAsDialogComponent } = useDashboardComponentsContext();

    return <SaveAsDialogComponent {...props} />;
};
