// (C) 2021-2025 GoodData Corporation

import { type ReactElement } from "react";

import {
    CancelButton,
    EditButton,
    SaveAsNewButton,
    SaveButton,
    SettingButton,
    ShareButton,
} from "./button/index.js";
import { type IButtonBarProps } from "./types.js";

/**
 * @alpha
 */
export function DefaultButtonBar({
    children,
    cancelButtonProps,
    saveButtonProps,
    settingButtonProps,
    editButtonProps,
    saveAsNewButtonProps,
    shareButtonProps,
    childContentPosition = "left",
}: IButtonBarProps): ReactElement {
    // TODO INE allow customization of buttons via getter from props
    return (
        <div className="dash-control-buttons">
            {childContentPosition === "left" && children}
            <CancelButton {...cancelButtonProps} />
            <SaveButton {...saveButtonProps} />
            <SettingButton {...settingButtonProps} />
            <EditButton {...editButtonProps} />
            <SaveAsNewButton {...saveAsNewButtonProps} />
            <ShareButton {...shareButtonProps} />
            {childContentPosition === "right" && children}
        </div>
    );
}
