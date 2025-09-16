// (C) 2024-2025 GoodData Corporation

import { ReactElement } from "react";

import { DefaultWidgetDeleteDialog } from "./DefaultWidgetDeleteDialog.js";
import { IWidgetDeleteDialogProps } from "./types.js";

/**
 * @internal
 */
export function WidgetDeleteDialog(props: IWidgetDeleteDialogProps): ReactElement {
    // No customization from useDashboardComponentsContext for now
    return <DefaultWidgetDeleteDialog {...props} />;
}
