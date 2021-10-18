// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";

/**
 * @internal
 */
export const ShareDialog = (): JSX.Element => {
    const { ShareDialogComponent } = useDashboardComponentsContext();

    return <ShareDialogComponent />;
};
