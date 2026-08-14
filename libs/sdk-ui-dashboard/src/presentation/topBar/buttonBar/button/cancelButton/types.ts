// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

/**
 * @beta
 */
export interface ICancelButtonProps {
    isVisible: boolean;
    isEnabled?: boolean;
    onCancelClick: () => void;
}

/**
 * @beta
 */
export type CustomCancelButtonComponent = ComponentType<ICancelButtonProps>;
