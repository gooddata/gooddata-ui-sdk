// (C) 2007-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

export interface IHeaderWorkspacePickerItemProps {
    title: string;
    isDemo?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function HeaderWorkspacePickerItem({
    title,
    isLoading,
    isSelected,
    isDemo,
    onClick,
}: IHeaderWorkspacePickerItemProps) {
    const intl = useIntl();

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
