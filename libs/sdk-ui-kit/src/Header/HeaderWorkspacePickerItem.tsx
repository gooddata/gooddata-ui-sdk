// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { IntlShape, injectIntl } from "react-intl";

import { stringUtils } from "@gooddata/util";

export interface IHeaderWorkspacePickerItemProps {
    title: string;
    isDemo?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    intl: IntlShape;
}

export function CoreHeaderWorkspacePickerItem({
    intl,
    title,
    isLoading,
    isSelected,
    isDemo,
    onClick,
}: IHeaderWorkspacePickerItemProps) {
    const t = intl.formatMessage;

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
        <button className={classes} title={title} onClick={onClick}>
            <span className="project-title">{title}</span>
            {isDemo ? (
                <span className="demo-sticker">{t({ id: "gs.header.projectPicker.demo" })}</span>
            ) : null}
        </button>
    );
}

export const HeaderWorkspacePickerItem = injectIntl(CoreHeaderWorkspacePickerItem);
