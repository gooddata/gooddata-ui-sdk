// (C) 2021-2022 GoodData Corporation

import React from "react";
import { ISaveButtonProps } from "./types";
import { DefaultSaveButton } from "./DefaultSaveButton";

/**
 * @internal
 */
export const SaveButton = (props: ISaveButtonProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultSaveButton {...props} />;
};
