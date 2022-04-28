// (C) 2021-2022 GoodData Corporation
import React, { PropsWithChildren } from "react";

import { IButtonBarProps } from "./types";
import { CancelButton, EditButton, SaveAsNewButton, SaveButton, ShareButton } from "./button";

/**
 * @alpha
 */
export const DefaultButtonBar: React.FC<PropsWithChildren<IButtonBarProps>> = (props): JSX.Element => {
    const {
        children,
        cancelButtonProps,
        saveButtonProps,
        editButtonProps,
        saveAsNewButtonProps,
        shareButtonProps,
    } = props;

    // TODO INE allow customization of buttons via getter from props
    return (
        <div className="dash-control-buttons">
            {children}
            <CancelButton {...cancelButtonProps} />
            <SaveButton {...saveButtonProps} />
            <EditButton {...editButtonProps} />
            <SaveAsNewButton {...saveAsNewButtonProps} />
            <ShareButton {...shareButtonProps} />
        </div>
    );
};
