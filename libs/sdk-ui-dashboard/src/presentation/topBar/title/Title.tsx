// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { ITitleProps } from "./types.js";

/**
 * @internal
 */
export const Title = (props: ITitleProps): JSX.Element => {
    const { TitleComponent } = useDashboardComponentsContext();

    return <TitleComponent {...props} />;
};
