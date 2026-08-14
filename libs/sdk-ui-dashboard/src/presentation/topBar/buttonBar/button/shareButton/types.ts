// (C) 2021-2026 GoodData Corporation

import { type ComponentType } from "react";

/**
 * @beta
 */
export interface IShareButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    onShareButtonClick: () => void;
}

/**
 * @alpha
 */
export type CustomShareButtonComponent = ComponentType<IShareButtonProps>;
