// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";

/**
 * @internal
 */
export const SaveAsDialog = (): JSX.Element => {
    const { SaveAsDialogComponent } = useDashboardComponentsContext();

    return <SaveAsDialogComponent />;
};
