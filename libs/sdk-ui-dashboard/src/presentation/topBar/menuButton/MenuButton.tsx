// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IMenuButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function MenuButton(props: IMenuButtonProps): ReactElement {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent {...props} />;
}
