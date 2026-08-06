// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsTimezoneDialogOpen } from "../../../model/store/ui/uiSelectors.js";
import { TimezoneDialog } from "../../timezoneDialog/TimezoneDialog.js";

/**
 * @internal
 */
export function TimezoneDialogProvider(): ReactElement | null {
    const isOpen = useDashboardSelector(selectIsTimezoneDialogOpen);

    if (!isOpen) {
        return null;
    }

    return <TimezoneDialog />;
}
