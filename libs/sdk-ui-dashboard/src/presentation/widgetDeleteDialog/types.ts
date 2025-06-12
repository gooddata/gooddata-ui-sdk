// (C) 2024 GoodData Corporation

import { IWidget } from "@gooddata/sdk-model";
import { ComponentType } from "react";

/**
 * @internal
 */
export interface IWidgetDeleteDialogProps {
    isVisible: boolean;
    showAlertsMessage: boolean;
    showSchedulesMessage: boolean;
    onDelete: () => void;
    onCancel: () => void;
    widget: IWidget | undefined;
}

/**
 * @internal
 */
export type CustomWidgetDeleteDialogComponent = ComponentType<IWidgetDeleteDialogProps>;
