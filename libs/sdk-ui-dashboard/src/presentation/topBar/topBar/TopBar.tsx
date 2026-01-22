// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ITopBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function TopBar(props: ITopBarProps): ReactElement {
    const { TopBarComponent } = useDashboardComponentsContext();

    return <TopBarComponent {...props} />;
}
