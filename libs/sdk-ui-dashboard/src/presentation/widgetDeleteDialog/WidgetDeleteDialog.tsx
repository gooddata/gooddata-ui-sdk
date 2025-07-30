// (C) 2024-2025 GoodData Corporation

import React, { ReactElement } from "react";
import { IWidgetDeleteDialogProps } from "./types.js";
import { DefaultWidgetDeleteDialog } from "./DefaultWidgetDeleteDialog.js";

/**
 * @internal
 */
export const WidgetDeleteDialog = (props: IWidgetDeleteDialogProps): ReactElement => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultWidgetDeleteDialog {...props} />;
};
