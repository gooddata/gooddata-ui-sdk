// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultDeleteDialog } from "./DefaultDeleteDialog.js";
import { type IDeleteDialogProps } from "./types.js";

/**
 * @internal
 */
export function DeleteDialog(props: IDeleteDialogProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultDeleteDialog {...props} />;
}
