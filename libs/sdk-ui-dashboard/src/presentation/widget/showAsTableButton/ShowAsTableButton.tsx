// (C) 2020-2025 GoodData Corporation

import { ReactElement, useMemo } from "react";

import { IShowAsTableButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

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
