// (C) 2024-2025 GoodData Corporation

import { type ComponentType } from "react";

import { type IWidget } from "@gooddata/sdk-model";

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

    /**
     * Whether the widget renders something the current user is not allowed to see. Such a widget must
     * not be named: its stored title can be the name of the object they have no access to.
     */
    isRestricted?: boolean;
}

/**
 * @internal
 */
export type CustomWidgetDeleteDialogComponent = ComponentType<IWidgetDeleteDialogProps>;
