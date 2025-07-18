// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { ITopBarProps } from "./types.js";

/**
 * @internal
 */
export function TopBar(props: ITopBarProps): ReactElement {
    const { TopBarComponent } = useDashboardComponentsContext();

    return <TopBarComponent {...props} />;
}
