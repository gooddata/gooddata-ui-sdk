// (C) 2021-2025 GoodData Corporation

import React, { ReactElement } from "react";
import { ICancelButtonProps } from "./types.js";
import { DefaultCancelButton } from "./DefaultCancelButton.js";

/**
 * @internal
 */
export const CancelButton = (props: ICancelButtonProps): ReactElement => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelButton {...props} />;
};
