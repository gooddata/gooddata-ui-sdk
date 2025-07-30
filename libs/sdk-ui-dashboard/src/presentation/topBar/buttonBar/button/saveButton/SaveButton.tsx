// (C) 2021-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";
import { ISaveButtonProps } from "./types.js";

/**
 * @internal
 */
export const SaveButton = (props: ISaveButtonProps): ReactElement => {
    const { SaveButtonComponent } = useDashboardComponentsContext();
    return <SaveButtonComponent {...props} />;
};
