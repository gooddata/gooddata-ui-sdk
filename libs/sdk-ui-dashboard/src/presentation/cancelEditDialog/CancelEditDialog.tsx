// (C) 2022-2025 GoodData Corporation

import { DefaultCancelEditDialog } from "./DefaultCancelEditDialog.js";
import { ICancelEditDialogProps } from "./types.js";

/**
 * @internal
 */
export function CancelEditDialog(props: ICancelEditDialogProps) {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelEditDialog {...props} />;
}
