// (C) 2022 GoodData Corporation

import React from "react";
import { IKpiDeleteDialogProps } from "./types.js";
import { DefaultKpiDeleteDialog } from "./DefaultKpiDeleteDialog.js";

/**
 * @internal
 */
export const KpiDeleteDialog = (props: IKpiDeleteDialogProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultKpiDeleteDialog {...props} />;
};
