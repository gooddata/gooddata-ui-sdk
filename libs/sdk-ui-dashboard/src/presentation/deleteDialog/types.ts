// (C) 2022-2024 GoodData Corporation

import { ComponentType } from "react";

/**
 * @internal
 */
export interface IDeleteDialogProps {
    isVisible: boolean;
    isSchedulingEnabled: boolean;
    isAlertingEnabled: boolean;
    isDrillToDashboardEnabled: boolean;
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
