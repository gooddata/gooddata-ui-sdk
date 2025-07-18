// (C) 2021-2025 GoodData Corporation
import { ComponentType, ReactNode } from "react";
import {
    ICancelButtonProps,
    IEditButtonProps,
    ISaveButtonProps,
    ISaveAsNewButtonProps,
    IShareButtonProps,
    ISettingButtonProps,
} from "./button/types.js";

/**
 * @beta
 */
export interface IButtonBarProps {
    buttons?: ReactNode;
    // positioning the children's content for ButtonBar to 'left' (default) or 'right'
    childContentPosition?: "left" | "right";
    shareButtonProps: IShareButtonProps;
    DefaultButtonBar: CustomButtonBarComponent;
    cancelButtonProps: ICancelButtonProps;
    editButtonProps: IEditButtonProps;
    saveButtonProps: ISaveButtonProps;
    settingButtonProps: ISettingButtonProps;
    saveAsNewButtonProps: ISaveAsNewButtonProps;
    children?: ReactNode;
}

/**
 * @beta
 */
export type CustomButtonBarComponent = ComponentType<IButtonBarProps>;
