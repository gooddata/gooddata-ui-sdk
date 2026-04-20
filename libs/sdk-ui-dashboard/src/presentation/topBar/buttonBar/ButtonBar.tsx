// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { type IButtonBarProps } from "./types.js";

/**
 * @internal
 */
export function ButtonBar(props: IButtonBarProps): ReactElement {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent {...props} />;
}
