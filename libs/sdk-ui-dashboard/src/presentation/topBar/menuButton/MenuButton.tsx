// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type IMenuButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function MenuButton(props: IMenuButtonProps): ReactElement {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent {...props} />;
}
