// (C) 2024-2025 GoodData Corporation

import { ComponentType } from "react";

import { IWidget } from "@gooddata/sdk-model";

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
