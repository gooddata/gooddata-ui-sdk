// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type IShareDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function ShareDialog(props: IShareDialogProps): ReactElement {
    const { ShareDialogComponent } = useDashboardComponentsContext();

    return <ShareDialogComponent {...props} />;
}
