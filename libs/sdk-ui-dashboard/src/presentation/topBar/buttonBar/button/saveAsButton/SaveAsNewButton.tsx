// (C) 2021-2022 GoodData Corporation

import React from "react";
import { ISaveAsNewButtonProps } from "./types";
import { DefaultSaveAsNewButton } from "./DefaultSaveAsNewButton";

/**
 * @internal
 */
export const SaveAsNewButton = (props: ISaveAsNewButtonProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultSaveAsNewButton {...props} />;
};
