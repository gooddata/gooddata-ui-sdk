// (C) 2022-2023 GoodData Corporation

import { ComponentType } from "react";

/**
 * @beta
 */
export interface ISaveAsNewButtonProps {
    isVisible: boolean;
    onSaveAsNewClick: () => void;
}

/**
 * @beta
 */
export type CustomSaveAsNewButtonComponent = ComponentType<ISaveAsNewButtonProps>;
