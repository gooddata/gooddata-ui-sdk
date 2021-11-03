// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { IShareProps } from "../../../types";

/**
 * @alpha
 */
export interface IShareButtonProps {
    onShareButtonClick: (newShareProps: IShareProps) => void;
}

/**
 * @alpha
 */
export type CustomShareButtonComponent = ComponentType;
