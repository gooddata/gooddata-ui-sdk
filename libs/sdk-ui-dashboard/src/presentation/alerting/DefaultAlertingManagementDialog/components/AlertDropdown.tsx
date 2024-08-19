// (C) 2020-2024 GoodData Corporation
import React, { Fragment } from "react";
import { Overlay, Separator } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { defineMessages, FormattedMessage } from "react-intl";

import { IAlertDropdownProps } from "../../types.js";

interface IDropdownItemProps {
    onClick: () => void;
    labelIntlKey: string;
    classNames: string;
    separator?: "up" | "down";
}

const DropdownItem: React.FC<IDropdownItemProps> = ({ onClick, labelIntlKey, classNames }) => {
    const cssClasses = cx("gd-list-item gd-menu-item", classNames);
    return (
        <div className={cssClasses} onClick={onClick}>
            <FormattedMessage id={labelIntlKey} />
        </div>
    );
};

const labelMessages = defineMessages({
    delete: { id: "alerting.alert.menu.delete" },
    pause: { id: "alerting.alert.menu.pause" },
    activate: { id: "alerting.alert.menu.activate" },
    edit: { id: "alerting.alert.menu.edit" },
});

export const AlertDropdown: React.FC<IAlertDropdownProps> = (props) => {
    const { paused, alignTo, onClose, onEdit, onPause, onDelete, onActivate } = props;

    const dropdownActions: IDropdownItemProps[] = [
        {
            labelIntlKey: labelMessages.edit.id,
            classNames: "s-edit-alert-button",
            onClick: onEdit,
        },
        paused
            ? {
                  labelIntlKey: labelMessages.activate.id,
                  classNames: "s-activate-alert-button",
                  onClick: onActivate,
              }
            : {
                  labelIntlKey: labelMessages.pause.id,
                  classNames: "s-pause-alert-button",
                  onClick: onPause,
              },
        {
            labelIntlKey: labelMessages.delete.id,
            classNames: "s-delete-alert-button deleteItem",
            onClick: onDelete,
            separator: "up",
        },
    ];

    return (
        <Overlay
            className="s-alert-dropdown"
            closeOnOutsideClick
            alignTo={alignTo}
            alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
            onClose={onClose}
        >
            <div
                className={cx(
                    "gd-schedule-email-dialog-menu",
                    "gd-dropdown gd-menu-wrapper gd-menu-wrapper-small-spacing",
                )}
            >
                {dropdownActions.map((item) => {
                    return (
                        <Fragment key={item.labelIntlKey}>
                            {item.separator === "up" && <Separator />}
                            <DropdownItem
                                onClick={item.onClick}
                                labelIntlKey={item.labelIntlKey}
                                classNames={item.classNames}
                            />
                            {item.separator === "down" && <Separator />}
                        </Fragment>
                    );
                })}
            </div>
        </Overlay>
    );
};
