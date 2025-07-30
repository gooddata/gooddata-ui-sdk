// (C) 2021-2025 GoodData Corporation

import React, { ReactElement } from "react";
import { ISaveAsNewButtonProps } from "./types.js";
import { DefaultSaveAsNewButton } from "./DefaultSaveAsNewButton.js";

/**
 * @internal
 */
export const SaveAsNewButton = (props: ISaveAsNewButtonProps): ReactElement => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultSaveAsNewButton {...props} />;
};
