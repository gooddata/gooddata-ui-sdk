// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { ISaveAsDialogProps } from "./types.js";

/**
 * @internal
 */
export const SaveAsDialog = (props: ISaveAsDialogProps): JSX.Element => {
    const { SaveAsDialogComponent } = useDashboardComponentsContext();

    return <SaveAsDialogComponent {...props} />;
};
