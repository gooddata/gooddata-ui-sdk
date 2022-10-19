// (C) 2007-2022 GoodData Corporation
import React from "react";
import { injectIntl, IntlShape } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

export interface IHeaderWorkspacePickerItemProps {
    title: string;
    isDemo?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    intl: IntlShape;
}

export const CoreHeaderWorkspacePickerItem: React.FC<IHeaderWorkspacePickerItemProps> = ({
    intl,
    title,
    isLoading,
    isSelected,
    isDemo,
    onClick,
}) => {
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
        <div className={classes} title={title} onClick={onClick}>
            <span className="project-title">{title}</span>
            {isDemo ? (
                <span className="demo-sticker">{t({ id: "gs.header.projectPicker.demo" })}</span>
            ) : null}
        </div>
    );
};

export const HeaderWorkspacePickerItem = injectIntl(CoreHeaderWorkspacePickerItem);
