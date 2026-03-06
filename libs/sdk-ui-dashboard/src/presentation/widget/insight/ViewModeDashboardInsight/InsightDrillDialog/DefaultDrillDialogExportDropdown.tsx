// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { DrillDialogExportDropdown } from "./DrillDialogExportDropdown.js";
import { type IDrillDialogExportDropdownProps } from "./drillDialogExportDropdownTypes.js";

/**
 * @internal
 */
export function DefaultDrillDialogExportDropdown(props: IDrillDialogExportDropdownProps): ReactElement {
    return <DrillDialogExportDropdown {...props} />;
}
