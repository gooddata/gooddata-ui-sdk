// (C) 2021-2025 GoodData Corporation

import { ReactElement } from "react";

import { ISaveButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";

/**
 * @internal
 */
export function SaveButton(props: ISaveButtonProps): ReactElement {
    const { SaveButtonComponent } = useDashboardComponentsContext();
    return <SaveButtonComponent {...props} />;
}
