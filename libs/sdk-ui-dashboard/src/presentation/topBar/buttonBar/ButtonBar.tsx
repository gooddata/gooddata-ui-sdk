// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const ButtonBar = (): JSX.Element => {
    const { ButtonBarComponent } = useDashboardComponentsContext();

    return <ButtonBarComponent />;
};
