// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { type ITitleProps } from "./types.js";

/**
 * @internal
 */
export function Title(props: ITitleProps): ReactElement {
    const { TitleComponent } = useDashboardComponentsContext();

    return <TitleComponent {...props} />;
}
