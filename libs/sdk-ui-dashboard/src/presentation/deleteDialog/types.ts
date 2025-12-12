// (C) 2022-2025 GoodData Corporation

import { type ComponentType } from "react";

/**
 * @internal
 */
export interface IDeleteDialogProps {
    isVisible: boolean;
    isSchedulingEnabled: boolean;
    isAlertingEnabled: boolean;
    onDelete: () => void;
    onCancel: () => void;
    dashboardTitle: string;
    showAlertsMessage: boolean;
    showSchedulesMessage: boolean;
}

/**
 * @internal
 */
export type CustomDeleteDialogComponent = ComponentType<IDeleteDialogProps>;
