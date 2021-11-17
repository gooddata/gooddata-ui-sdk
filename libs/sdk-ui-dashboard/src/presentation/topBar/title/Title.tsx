// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { ITitleProps } from "./types";

/**
 * @internal
 */
export const Title = (props: ITitleProps): JSX.Element => {
    const { TitleComponent } = useDashboardComponentsContext();

    return <TitleComponent {...props} />;
};
