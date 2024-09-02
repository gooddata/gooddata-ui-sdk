// (C) 2024 GoodData Corporation

import React from "react";
import { IWidgetDeleteDialogProps } from "./types.js";
import { DefaultWidgetDeleteDialog } from "./DefaultWidgetDeleteDialog.js";

/**
 * @internal
 */
export const WidgetDeleteDialog = (props: IWidgetDeleteDialogProps): JSX.Element => {
    // No customization from useDashboardComponentsContext for now
    return <DefaultWidgetDeleteDialog {...props} />;
};
