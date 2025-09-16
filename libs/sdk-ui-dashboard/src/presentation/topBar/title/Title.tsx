// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { ITitleProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function Title(props: ITitleProps): ReactElement {
    const { TitleComponent } = useDashboardComponentsContext();

    return <TitleComponent {...props} />;
}
