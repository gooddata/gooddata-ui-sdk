// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsDensityDialogOpen } from "../../../model/store/ui/uiSelectors.js";
import { DensityDialog } from "../../densityDialog/DensityDialog.js";

/**
 * @internal
 */
export function DensityDialogProvider(): ReactElement | null {
    const isOpen = useDashboardSelector(selectIsDensityDialogOpen);

    if (!isOpen) {
        return null;
    }

    return <DensityDialog />;
}
