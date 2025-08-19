// (C) 2021-2025 GoodData Corporation
import React, { ReactElement } from "react";

import {
    CancelButton,
    EditButton,
    SaveAsNewButton,
    SaveButton,
    SettingButton,
    ShareButton,
} from "./button/index.js";
import { IButtonBarProps } from "./types.js";

/**
 * @alpha
 */
export const DefaultButtonBar: React.FC<IButtonBarProps> = (props): ReactElement => {
    const {
        children,
        cancelButtonProps,
        saveButtonProps,
        settingButtonProps,
        editButtonProps,
        saveAsNewButtonProps,
        shareButtonProps,
        childContentPosition = "left",
    } = props;

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
};
