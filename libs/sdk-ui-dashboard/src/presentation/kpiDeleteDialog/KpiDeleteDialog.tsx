// (C) 2022-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { DefaultKpiDeleteDialog } from "./DefaultKpiDeleteDialog.js";
import { IKpiDeleteDialogProps } from "./types.js";

/**
 * @internal
 */
export const KpiDeleteDialog = (props: IKpiDeleteDialogProps): ReactElement => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultKpiDeleteDialog {...props} />;
};
