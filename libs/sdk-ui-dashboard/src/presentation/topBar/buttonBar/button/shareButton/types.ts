// (C) 2021-2022 GoodData Corporation
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IShareButtonProps {
    isVisible: boolean;
    onShareButtonClick: () => void;
}

/**
 * @alpha
 */
export type CustomShareButtonComponent = ComponentType<IShareButtonProps>;
