// (C) 2022-2025 GoodData Corporation

import { ComponentType } from "react";

/**
 * @beta
 */
export interface IEditButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    onEditClick: () => void;
    tooltipText: string;
}

/**
 * @beta
 */
export type CustomEditModeButtonComponent = ComponentType<IEditButtonProps>;
