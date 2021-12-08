// (C) 2007-2020 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

export interface IHeaderWorkspacePickerItemProps {
    title: string;
    isDemo?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const HeaderWorkspacePickerItem: React.FC<IHeaderWorkspacePickerItemProps> = ({
    title,
    isLoading,
    isSelected,
    isDemo,
    onClick,
}) => {
    if (isLoading) {
        return (
            <div className="gd-list-item gd-project-list-item gd-is-loading">
                <div className="gd-spinner small" />
            </div>
        );
    }

    const classes = cx({
        "gd-list-item": true,
        "gd-project-list-item": true,
        [`s-${stringUtils.simplifyText(title)}`]: true,
        "gd-is-selected": isSelected,
        "gd-is-demo": isDemo,
    });

    return (
        <div className={classes} title={title} onClick={onClick}>
            <span className="project-title">{title}</span>
            {isDemo && (
                <span className="demo-sticker">
                    <FormattedMessage id="gs.header.projectPicker.demo" />
                </span>
            )}
        </div>
    );
};
