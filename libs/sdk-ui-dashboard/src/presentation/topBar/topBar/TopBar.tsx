// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ITopBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function TopBar(props: ITopBarProps): ReactElement {
    const { TopBarComponent } = useDashboardComponentsContext();

    return <TopBarComponent {...props} />;
}
