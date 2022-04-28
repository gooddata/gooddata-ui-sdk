// (C) 2022 GoodData Corporation

import { ComponentType } from "react";

/**
 * @internal
 */
export interface IEditButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    onEditClick: () => void;
}

/**
 * @internal
 */
export type CustomEditModeButtonComponent = ComponentType<IEditButtonProps>;
