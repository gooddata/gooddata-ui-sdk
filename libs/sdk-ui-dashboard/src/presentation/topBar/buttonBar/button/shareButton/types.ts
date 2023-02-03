// (C) 2021-2023 GoodData Corporation
import { ComponentType } from "react";

/**
 * @beta
 */
export interface IShareButtonProps {
    isVisible: boolean;
    onShareButtonClick: () => void;
}

/**
 * @alpha
 */
export type CustomShareButtonComponent = ComponentType<IShareButtonProps>;
