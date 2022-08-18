// (C) 2021-2022 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../../../dashboardContexts";
import { ISaveButtonProps } from "./types";

/**
 * @internal
 */
export const SaveButton = (props: ISaveButtonProps): JSX.Element => {
    const { SaveButtonComponent } = useDashboardComponentsContext();
    return <SaveButtonComponent {...props} />;
};
