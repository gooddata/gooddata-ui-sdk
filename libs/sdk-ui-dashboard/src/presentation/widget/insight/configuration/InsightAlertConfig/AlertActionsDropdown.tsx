// (C) 2024 GoodData Corporation
import React, { useState } from "react";
import {
    Dropdown,
    Button,
    List,
    SingleSelectListItem,
    SingleSelectListItemType,
    Icon,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { useIntl } from "react-intl";
import { DROPDOWN_ITEM_HEIGHT, DROPDOWN_SEPARATOR_ITEM_HEIGHT } from "./constants.js";
import { messages } from "./messages.js";
import { AlertDeleteDialog } from "./AlertDeleteDialog.js";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

const ALERT_ACTIONS_DROPDOWN_OPTIONS: {
    title?: string;
    id?: "edit" | "pause" | "resume" | "delete";
    type?: SingleSelectListItemType;
}[] = [
    {
        title: messages.alertActionEdit.id,
        id: "edit",
    },
    {
        title: messages.alertActionPause.id,
        id: "pause",
    },
    {
        title: messages.alertActionResume.id,
        id: "resume",
    },
    {
        type: "separator",
    },
    {
        title: messages.alertActionDelete.id,
        id: "delete",
    },
];

const ALERT_ACTIONS_DROPDOWN_READONLY_OPTIONS: {
    title?: string;
    id?: "edit" | "pause" | "resume" | "delete";
    type?: SingleSelectListItemType;
}[] = [
    {
        title: messages.alertActionDelete.id,
        id: "delete",
    },
];

export interface IAlertActionsDropdownProps {
    alert: IAutomationMetadataObject;
    isReadOnly?: boolean;
    onEdit: () => void;
    onPause: () => void;
    onResume: () => void;
    onDelete: () => void;
    isPaused: boolean;
}

export const AlertActionsDropdown = ({
    alert,
    onEdit,
    onPause,
    onResume,
    onDelete,
    isPaused,
    isReadOnly,
}: IAlertActionsDropdownProps) => {
    const intl = useIntl();
    const options = isReadOnly
        ? ALERT_ACTIONS_DROPDOWN_READONLY_OPTIONS
        : ALERT_ACTIONS_DROPDOWN_OPTIONS.filter((option) => {
              if (option.id === "pause") {
                  return !isPaused;
              }
              if (option.id === "resume") {
                  return isPaused;
              }
              return true;
          });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <div className="gd-alert-actions-dropdown">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            className={cx(
                                "gd-alert-actions-dropdown__button gd-button-link gd-button-icon-only s-alert-actions-button",
                                {
                                    "gd-alert-actions-dropdown__button--open": isOpen,
                                },
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                        >
                            <Icon.Ellipsis />
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            width={80}
                            height={isReadOnly ? 28 : 94}
                            className="gd-alert-actions-dropdown__list s-alert-actions-list"
                            items={options}
                            itemHeightGetter={(idx) =>
                                options[idx].type === "separator"
                                    ? DROPDOWN_SEPARATOR_ITEM_HEIGHT
                                    : DROPDOWN_ITEM_HEIGHT
                            }
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    title={i.item.id ? intl.formatMessage({ id: i.item.title }) : ""}
                                    className={`gd-alert-actions-dropdown__list-item-${i.item.id}`}
                                    type={i.item.type}
                                    onClick={() => {
                                        switch (i.item.id) {
                                            case "edit":
                                                onEdit();
                                                break;
                                            case "resume":
                                                onResume();
                                                break;
                                            case "pause":
                                                onPause();
                                                break;
                                            case "delete":
                                                setShowDeleteDialog(true);
                                                break;
                                        }

                                        closeDropdown();
                                    }}
                                />
                            )}
                        />
                    );
                }}
            />
            {showDeleteDialog ? (
                <AlertDeleteDialog
                    title={alert.title}
                    onDelete={() => {
                        onDelete();
                        setShowDeleteDialog(false);
                    }}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            ) : null}
        </div>
    );
};
