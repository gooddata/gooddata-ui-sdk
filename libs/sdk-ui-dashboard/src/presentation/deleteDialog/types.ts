// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

/**
 * @internal
 */
export interface IDeleteDialogProps {
    isVisible: boolean;
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
