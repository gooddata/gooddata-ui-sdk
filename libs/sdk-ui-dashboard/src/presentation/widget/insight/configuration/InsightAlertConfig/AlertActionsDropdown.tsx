// (C) 2024 GoodData Corporation
import React from "react";
import {
    Dropdown,
    Button,
    List,
    SingleSelectListItem,
    SingleSelectListItemType,
    Icon,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { DROPDOWN_ITEM_HEIGHT, DROPDOWN_SEPARATOR_ITEM_HEIGHT } from "./constants.js";

const ALERT_ACTIONS_DROPDOWN_OPTIONS: {
    title?: string;
    id?: "edit" | "pause" | "resume" | "delete";
    type?: SingleSelectListItemType;
}[] = [
    {
        title: "Edit",
        id: "edit",
    },
    {
        title: "Pause",
        id: "pause",
    },
    {
        title: "Resume",
        id: "resume",
    },
    {
        type: "separator",
    },
    {
        title: "Delete",
        id: "delete",
    },
];

export interface IAlertActionsDropdownProps {
    onEdit: () => void;
    onPause: () => void;
    onResume: () => void;
    onDelete: () => void;
    isPaused: boolean;
}

export const AlertActionsDropdown = ({
    onEdit,
    onPause,
    onResume,
    onDelete,
    isPaused,
}: IAlertActionsDropdownProps) => {
    const options = ALERT_ACTIONS_DROPDOWN_OPTIONS.filter((option) => {
        if (option.id === "pause") {
            return !isPaused;
        }
        if (option.id === "resume") {
            return isPaused;
        }
        return true;
    });

    return (
        <div className="gd-alert-actions-dropdown">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            className={cx(
                                "gd-alert-actions-dropdown__button gd-button-link gd-button-icon-only",
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
                            height={94}
                            className="gd-alert-actions-dropdown__list"
                            items={options}
                            itemHeightGetter={(idx) =>
                                options[idx].type === "separator"
                                    ? DROPDOWN_SEPARATOR_ITEM_HEIGHT
                                    : DROPDOWN_ITEM_HEIGHT
                            }
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    title={i.item.title}
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
                                                onDelete();
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
        </div>
    );
};
