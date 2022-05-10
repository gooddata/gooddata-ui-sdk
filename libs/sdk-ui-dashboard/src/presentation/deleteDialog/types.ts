// (C) 2022 GoodData Corporation

import { ComponentType } from "react";

/**
 * @internal
 */
export interface IDeleteDialogProps {
    isVisible: boolean;
    isKpiWidgetEnabled: boolean;
    isScheduleEmailsEnabled: boolean;
    isDrillToDashboardEnabled: boolean;
    onDelete: () => void;
    onCancel: () => void;
}

/**
 * @internal
 */
export type CustomDeleteDialogComponent = ComponentType<IDeleteDialogProps>;
