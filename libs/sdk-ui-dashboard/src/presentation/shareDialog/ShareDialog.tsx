// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";
import { IShareDialogProps } from "./types";

/**
 * @internal
 */
export const ShareDialog = (props: IShareDialogProps): JSX.Element => {
    const { ShareDialogComponent } = useDashboardComponentsContext();

    return <ShareDialogComponent {...props} />;
};
