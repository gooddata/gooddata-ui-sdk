// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type IButtonBarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function ButtonBar(props: IButtonBarProps): ReactElement {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent {...props} />;
}
