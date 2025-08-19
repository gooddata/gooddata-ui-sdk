// (C) 2021-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { DefaultEditButton } from "./DefaultEditButton.js";
import { IEditButtonProps } from "./types.js";

/**
 * @internal
 */
export const EditButton = (props: IEditButtonProps): ReactElement => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultEditButton {...props} />;
};
