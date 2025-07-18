// (C) 2021-2025 GoodData Corporation

import { DefaultEditButton } from "./DefaultEditButton.js";
import { IEditButtonProps } from "./types.js";

/**
 * @internal
 */
export function EditButton(props: IEditButtonProps) {
    // No customization from useDashboardComponentsContext for now
    return <DefaultEditButton {...props} />;
}
