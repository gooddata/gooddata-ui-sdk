// (C) 2022 GoodData Corporation

import React from "react";
import { IDeleteDialogProps } from "./types.js";
import { DefaultDeleteDialog } from "./DefaultDeleteDialog.js";

/**
 * @internal
 */
export const DeleteDialog = (props: IDeleteDialogProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultDeleteDialog {...props} />;
};
