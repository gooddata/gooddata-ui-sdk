// (C) 2021-2022 GoodData Corporation
import React, { ComponentType } from "react";
import {
    ICancelButtonProps,
    IEditButtonProps,
    ISaveButtonProps,
    ISaveAsNewButtonProps,
    IShareButtonProps,
} from "./button/types";

/**
 * @alpha
 */
export interface IButtonBarProps {
    buttons?: React.ReactNode;
    cancelButtonProps: ICancelButtonProps;
    editButtonProps: IEditButtonProps;
    saveButtonProps: ISaveButtonProps;
    saveAsNewButtonProps: ISaveAsNewButtonProps;
    shareButtonProps: IShareButtonProps;
    DefaultButtonBar: CustomButtonBarComponent;
}

/**
 * @alpha
 */
export type CustomButtonBarComponent = ComponentType<IButtonBarProps>;
