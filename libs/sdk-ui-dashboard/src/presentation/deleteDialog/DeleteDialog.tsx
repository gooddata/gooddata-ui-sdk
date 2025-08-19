// (C) 2022-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { DefaultDeleteDialog } from "./DefaultDeleteDialog.js";
import { IDeleteDialogProps } from "./types.js";

/**
 * @internal
 */
export const DeleteDialog = (props: IDeleteDialogProps): ReactElement => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultDeleteDialog {...props} />;
};
