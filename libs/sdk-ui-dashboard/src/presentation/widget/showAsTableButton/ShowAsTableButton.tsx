// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { type IShowAsTableButtonProps } from "./types.js";

/**
 * @internal
 */
export function ShowAsTableButton(props: IShowAsTableButtonProps): ReactElement {
    const { widget } = props;
    const { ShowAsTableButtonComponentProvider } = useDashboardComponentsContext();
    const ShowAsTableButtonComponent = useMemo(
        () => ShowAsTableButtonComponentProvider(widget),
        [ShowAsTableButtonComponentProvider, widget],
    );

    return <ShowAsTableButtonComponent {...props} />;
}
