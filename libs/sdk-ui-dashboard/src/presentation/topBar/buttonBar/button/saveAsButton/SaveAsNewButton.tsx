// (C) 2021-2025 GoodData Corporation

import { ISaveAsNewButtonProps } from "./types.js";
import { DefaultSaveAsNewButton } from "./DefaultSaveAsNewButton.js";

/**
 * @internal
 */
export function SaveAsNewButton(props: ISaveAsNewButtonProps) {
    // No customization from useDashboardComponentsContext for now
    return <DefaultSaveAsNewButton {...props} />;
}
