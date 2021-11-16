// (C) 2021 GoodData Corporation
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IShareButtonProps {
    onShareButtonClick: () => void;
}

/**
 * @alpha
 */
export type CustomShareButtonComponent = ComponentType<IShareButtonProps>;
