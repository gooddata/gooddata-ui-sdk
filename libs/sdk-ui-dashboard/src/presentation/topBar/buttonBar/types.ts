// (C) 2021-2023 GoodData Corporation
import React, { ComponentType } from "react";
import {
    ICancelButtonProps,
    IEditButtonProps,
    ISaveButtonProps,
    ISaveAsNewButtonProps,
    IShareButtonProps,
} from "./button/types";

/**
 * @beta
 */
export interface IButtonBarProps {
    buttons?: React.ReactNode;
    shareButtonProps: IShareButtonProps;
    DefaultButtonBar: CustomButtonBarComponent;
    cancelButtonProps: ICancelButtonProps;
    editButtonProps: IEditButtonProps;
    saveButtonProps: ISaveButtonProps;
    saveAsNewButtonProps: ISaveAsNewButtonProps;
}

/**
 * @beta
 */
export type CustomButtonBarComponent = ComponentType<IButtonBarProps>;
