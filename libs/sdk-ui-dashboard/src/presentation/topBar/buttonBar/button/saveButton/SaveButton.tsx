// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ISaveButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function SaveButton(props: ISaveButtonProps): ReactElement {
    const { SaveButtonComponent } = useDashboardComponentsContext();
    return <SaveButtonComponent {...props} />;
}
