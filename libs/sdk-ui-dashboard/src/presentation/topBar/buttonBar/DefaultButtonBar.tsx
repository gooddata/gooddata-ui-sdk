// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { CancelButton } from "./button/cancelButton/CancelButton.js";
import { EditButton } from "./button/editButton/EditButton.js";
import { SaveAsNewButton } from "./button/saveAsButton/SaveAsNewButton.js";
import { SaveButton } from "./button/saveButton/SaveButton.js";
import { SettingButton } from "./button/settingButton/SettingButton.js";
import { ShareButton } from "./button/shareButton/ShareButton.js";
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
