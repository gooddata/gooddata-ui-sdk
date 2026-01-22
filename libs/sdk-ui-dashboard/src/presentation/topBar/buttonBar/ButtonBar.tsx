// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IButtonBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function ButtonBar(props: IButtonBarProps): ReactElement {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent {...props} />;
}
