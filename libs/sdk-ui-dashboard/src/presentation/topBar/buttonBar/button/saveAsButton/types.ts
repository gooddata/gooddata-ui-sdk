// (C) 2022 GoodData Corporation

import { ComponentType } from "react";

/**
 * @internal
 */
export interface ISaveAsNewButtonProps {
    isVisible: boolean;
    onSaveAsNewClick: () => void;
}

/**
 * @internal
 */
export type CustomSaveAsNewButtonComponent = ComponentType<ISaveAsNewButtonProps>;
