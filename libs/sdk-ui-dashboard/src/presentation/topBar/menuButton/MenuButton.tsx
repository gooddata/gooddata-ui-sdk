// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { type IMenuButtonProps } from "./types.js";

/**
 * @internal
 */
export function MenuButton(props: IMenuButtonProps): ReactElement {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent {...props} />;
}
