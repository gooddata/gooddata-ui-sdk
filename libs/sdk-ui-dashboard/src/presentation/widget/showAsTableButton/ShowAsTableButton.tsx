// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IShowAsTableButtonProps } from "./types.js";

/**
 * @internal
 */
export const ShowAsTableButton = (props: IShowAsTableButtonProps): ReactElement => {
    const { widget } = props;
    const { ShowAsTableButtonComponentProvider } = useDashboardComponentsContext();
    const ShowAsTableButtonComponent = useMemo(
        () => ShowAsTableButtonComponentProvider(widget),
        [ShowAsTableButtonComponentProvider, widget],
    );

    return <ShowAsTableButtonComponent {...props} />;
};
