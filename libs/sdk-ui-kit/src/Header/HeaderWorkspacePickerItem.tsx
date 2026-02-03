// (C) 2007-2026 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";
import { type IntlShape, injectIntl } from "react-intl";

import { simplifyText } from "@gooddata/util";

export interface IHeaderWorkspacePickerItemProps {
    title: string;
    workspaceId: string;
    isDemo?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    intl: IntlShape;
}

function CoreHeaderWorkspacePickerItem({
    intl,
    workspaceId,
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
        [`s-${simplifyText(title)}`]: true,
        "gd-is-selected": isSelected,
        "gd-is-demo": isDemo,
    });

    const workspaceTitle = title || workspaceId;

    return (
        <button className={classes} title={workspaceTitle} onClick={onClick} tabIndex={-1}>
            <span className="project-title">{workspaceTitle}</span>
            {isDemo ? (
                <span className="demo-sticker">{t({ id: "gs.header.projectPicker.demo" })}</span>
            ) : null}
        </button>
    );
}

export const HeaderWorkspacePickerItem = injectIntl(CoreHeaderWorkspacePickerItem);
