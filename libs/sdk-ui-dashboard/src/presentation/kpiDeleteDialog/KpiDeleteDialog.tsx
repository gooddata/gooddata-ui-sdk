// (C) 2022 GoodData Corporation

import React from "react";
import { IKpiDeleteDialogProps } from "./types";
import { DefaultKpiDeleteDialog } from "./DefaultKpiDeleteDialog";

/**
 * @internal
 */
export const KpiDeleteDialog = (props: IKpiDeleteDialogProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultKpiDeleteDialog {...props} />;
};
