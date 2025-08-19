// (C) 2021-2025 GoodData Corporation
import React, { ComponentType } from "react";

import {
    ICancelButtonProps,
    IEditButtonProps,
    ISaveAsNewButtonProps,
    ISaveButtonProps,
    ISettingButtonProps,
    IShareButtonProps,
} from "./button/types.js";

/**
 * @beta
 */
export interface IButtonBarProps {
    buttons?: React.ReactNode;
    // positioning the children's content for ButtonBar to 'left' (default) or 'right'
    childContentPosition?: "left" | "right";
    shareButtonProps: IShareButtonProps;
    DefaultButtonBar: CustomButtonBarComponent;
    cancelButtonProps: ICancelButtonProps;
    editButtonProps: IEditButtonProps;
    saveButtonProps: ISaveButtonProps;
    settingButtonProps: ISettingButtonProps;
    saveAsNewButtonProps: ISaveAsNewButtonProps;
    children?: React.ReactNode;
}

/**
 * @beta
 */
export type CustomButtonBarComponent = ComponentType<IButtonBarProps>;
