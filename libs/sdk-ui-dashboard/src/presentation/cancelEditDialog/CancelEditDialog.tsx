// (C) 2022 GoodData Corporation
import React from "react";
import { DefaultCancelEditDialog } from "./DefaultCancelEditDialog";
import { ICancelEditDialogProps } from "./types";

/**
 * @internal
 */
export const CancelEditDialog: React.FC<ICancelEditDialogProps> = (props) => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultCancelEditDialog {...props} />;
};
