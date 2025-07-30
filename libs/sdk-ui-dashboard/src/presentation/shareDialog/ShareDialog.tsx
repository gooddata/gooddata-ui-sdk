// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IShareDialogProps } from "./types.js";

/**
 * @internal
 */
export const ShareDialog = (props: IShareDialogProps): ReactElement => {
    const { ShareDialogComponent } = useDashboardComponentsContext();

    return <ShareDialogComponent {...props} />;
};
