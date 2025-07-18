// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IMenuButtonProps } from "./types.js";

/**
 * @internal
 */
export function MenuButton(props: IMenuButtonProps): ReactElement {
    const { MenuButtonComponent } = useDashboardComponentsContext();

    return <MenuButtonComponent {...props} />;
}
