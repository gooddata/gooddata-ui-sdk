// (C) 2022 GoodData Corporation

import { ComponentType } from "react";

/**
 * @internal
 */
export interface ICancelButtonProps {
    isVisible: boolean;
    onCancelClick: () => void;
}

/**
 * @internal
 */
export type CustomCancelButtonComponent = ComponentType<ICancelButtonProps>;
