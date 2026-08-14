// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

/**
 * @beta
 */
export interface ISaveAsNewButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    onSaveAsNewClick: () => void;
}

/**
 * @beta
 */
export type CustomSaveAsNewButtonComponent = ComponentType<ISaveAsNewButtonProps>;
