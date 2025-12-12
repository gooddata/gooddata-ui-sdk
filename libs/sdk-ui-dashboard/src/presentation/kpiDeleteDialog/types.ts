// (C) 2022 GoodData Corporation
import { type ComponentType } from "react";

/**
 * @internal
 */
export interface IKpiDeleteDialogProps {
    isVisible: boolean;
    onDelete: () => void;
    onCancel: () => void;
}

/**
 * @internal
 */
export type CustomKpiDeleteDialogComponent = ComponentType<IKpiDeleteDialogProps>;
