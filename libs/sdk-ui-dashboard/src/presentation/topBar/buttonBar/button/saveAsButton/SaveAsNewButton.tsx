// (C) 2021-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { DefaultSaveAsNewButton } from "./DefaultSaveAsNewButton.js";
import { ISaveAsNewButtonProps } from "./types.js";

/**
 * @internal
 */
export function SaveAsNewButton(props: ISaveAsNewButtonProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultSaveAsNewButton {...props} />;
}
