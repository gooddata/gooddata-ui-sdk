// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { IShareButtonProps } from "../shareButton/types";
/**
 * @alpha
 */
export interface IButtonBarProps {
    buttons?: React.ReactNode;
    shareButtonProps: IShareButtonProps;
}

/**
 * @alpha
 */
export type CustomButtonBarComponent = ComponentType<IButtonBarProps>;
