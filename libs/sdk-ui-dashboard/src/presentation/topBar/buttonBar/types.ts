// (C) 2021-2026 GoodData Corporation

import { type ComponentType, type ReactNode } from "react";

import { type ICancelButtonProps } from "./button/cancelButton/types.js";
import { type IEditButtonProps } from "./button/editButton/types.js";
import { type ISaveAsNewButtonProps } from "./button/saveAsButton/types.js";
import { type ISaveButtonProps } from "./button/saveButton/types.js";
import { type ISettingButtonProps } from "./button/settingButton/types.js";
import { type IShareButtonProps } from "./button/shareButton/types.js";

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
