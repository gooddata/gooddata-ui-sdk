// (C) 2024 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { DROPDOWN_ITEM_HEIGHT } from "./constants.js";
import { IAlertTriggerMode } from "@gooddata/sdk-model";

const options: {
    title: string;
    id: IAlertTriggerMode;
}[] = [
    {
        title: "Always",
        id: "ALWAYS",
    },
    {
        title: "Once",
        id: "ONCE",
    },
];

export interface IAlertTriggerModeSelectProps {
    selectedTriggerMode: IAlertTriggerMode;
    onTriggerModeChange: (triggerMode: IAlertTriggerMode) => void;
}

export const AlertTriggerModeSelect = ({
    selectedTriggerMode,
    onTriggerModeChange,
}: IAlertTriggerModeSelectProps) => {
    const selectedOption = options.find((o) => o.id === selectedTriggerMode);

    return (
        <div className="gd-alert-trigger-mode-select">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            onClick={toggleDropdown}
                            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                            size="small"
                            variant="secondary"
                            className={cx("gd-edit-alert-trigger-mode-select__button", {
                                "is-active": isOpen,
                            })}
                        >
                            {selectedOption?.title}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-trigger-mode-select__list"
                            items={options}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    title={i.item.title}
                                    isSelected={i.item === selectedOption}
                                    onClick={() => {
                                        if (selectedTriggerMode !== i.item.id) {
                                            onTriggerModeChange(i.item.id);
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
