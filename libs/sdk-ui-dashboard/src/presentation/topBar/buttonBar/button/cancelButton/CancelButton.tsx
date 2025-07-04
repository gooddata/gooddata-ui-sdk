// (C) 2021-2025 GoodData Corporation

import { ICancelButtonProps } from "./types.js";
import { DefaultCancelButton } from "./DefaultCancelButton.js";

/**
 * @internal
 */
export function CancelButton(props: ICancelButtonProps) {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelButton {...props} />;
}
