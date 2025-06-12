// (C) 2022 GoodData Corporation
import React from "react";
import { DefaultCancelEditDialog } from "./DefaultCancelEditDialog.js";
import { ICancelEditDialogProps } from "./types.js";

/**
 * @internal
 */
export const CancelEditDialog: React.FC<ICancelEditDialogProps> = (props) => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelEditDialog {...props} />;
};
