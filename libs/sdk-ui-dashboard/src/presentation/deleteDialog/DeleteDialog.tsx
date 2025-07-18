// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";
import { IDeleteDialogProps } from "./types.js";
import { DefaultDeleteDialog } from "./DefaultDeleteDialog.js";

/**
 * @internal
 */
export function DeleteDialog(props: IDeleteDialogProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultDeleteDialog {...props} />;
}
