// (C) 2021-2022 GoodData Corporation

import React from "react";
import { ICancelButtonProps } from "./types";
import { DefaultCancelButton } from "./DefaultCancelButton";

/**
 * @internal
 */
export const CancelButton = (props: ICancelButtonProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelButton {...props} />;
};
