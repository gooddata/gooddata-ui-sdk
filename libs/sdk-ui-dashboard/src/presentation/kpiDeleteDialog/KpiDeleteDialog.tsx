// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";
import { IKpiDeleteDialogProps } from "./types.js";
import { DefaultKpiDeleteDialog } from "./DefaultKpiDeleteDialog.js";

/**
 * @internal
 */
export function KpiDeleteDialog(props: IKpiDeleteDialogProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultKpiDeleteDialog {...props} />;
}
