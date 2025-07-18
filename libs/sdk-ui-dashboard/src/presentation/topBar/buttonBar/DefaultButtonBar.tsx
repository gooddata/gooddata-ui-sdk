// (C) 2021-2025 GoodData Corporation

import { IButtonBarProps } from "./types.js";
import {
    CancelButton,
    EditButton,
    SaveAsNewButton,
    SaveButton,
    ShareButton,
    SettingButton,
} from "./button/index.js";

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
}: IButtonBarProps) {
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
