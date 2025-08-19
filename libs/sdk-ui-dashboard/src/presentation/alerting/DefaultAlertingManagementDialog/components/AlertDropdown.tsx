// (C) 2020-2025 GoodData Corporation
import React, { Fragment } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";

import { Overlay, Separator } from "@gooddata/sdk-ui-kit";

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
    resume: { id: "alerting.alert.menu.resume" },
    edit: { id: "alerting.alert.menu.edit" },
});

export const AlertDropdown: React.FC<IAlertDropdownProps> = (props) => {
    const { isReadOnly, paused, alignTo, onClose, onEdit, onPause, onDelete, onResume } = props;

    const editItem = {
        labelIntlKey: labelMessages.edit.id,
        classNames: "s-edit-alert-button",
        onClick: onEdit,
    };
    const pauseItem = paused
        ? {
              labelIntlKey: labelMessages.resume.id,
              classNames: "s-resume-alert-button",
              onClick: onResume,
          }
        : {
              labelIntlKey: labelMessages.pause.id,
              classNames: "s-pause-alert-button",
              onClick: onPause,
          };

    const deleteItem = {
        labelIntlKey: labelMessages.delete.id,
        classNames: "s-delete-alert-button deleteItem",
        onClick: onDelete,
        separator: !isReadOnly ? "up" : undefined,
    };

    const dropdownActions: IDropdownItemProps[] = isReadOnly
        ? [deleteItem]
        : [editItem, pauseItem, deleteItem];

    return (
        <Overlay
            className="s-alert-dropdown"
            closeOnOutsideClick
            alignTo={alignTo}
            alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
            onClose={onClose}
            positionType="fixed"
        >
            <div
                className={cx(
                    "gd-notifications-channels-dialog-menu",
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
