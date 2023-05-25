// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IShareDialogProps } from "./types.js";

/**
 * @internal
 */
export const ShareDialog = (props: IShareDialogProps): JSX.Element => {
    const { ShareDialogComponent } = useDashboardComponentsContext();

    return <ShareDialogComponent {...props} />;
};
