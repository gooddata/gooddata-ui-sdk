// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../../../dashboardContexts/DashboardComponentsContext.js";
import { type ISaveButtonProps } from "./types.js";

/**
 * @internal
 */
export function SaveButton(props: ISaveButtonProps): ReactElement {
    const { SaveButtonComponent } = useDashboardComponentsContext();
    return <SaveButtonComponent {...props} />;
}
