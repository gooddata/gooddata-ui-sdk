// (C) 2024 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem, OverlayPositionType } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { DROPDOWN_ITEM_HEIGHT } from "./constants.js";
import { IAlertTriggerMode } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import { messages } from "./messages.js";

const options: {
    title: string;
    id: IAlertTriggerMode;
}[] = [
    {
        title: messages.alertTriggerModeAlways.id,
        id: "ALWAYS",
    },
    {
        title: messages.alertTriggerModeOnce.id,
        id: "ONCE",
    },
];

export interface IAlertTriggerModeSelectProps {
    selectedTriggerMode: IAlertTriggerMode;
    onTriggerModeChange: (triggerMode: IAlertTriggerMode) => void;
    overlayPositionType?: OverlayPositionType;
}

export const AlertTriggerModeSelect = ({
    selectedTriggerMode,
    onTriggerModeChange,
    overlayPositionType,
}: IAlertTriggerModeSelectProps) => {
    const selectedOption = options.find((o) => o.id === selectedTriggerMode);
    const intl = useIntl();

    return (
        <div className="gd-alert-trigger-mode-select">
            <Dropdown
                overlayPositionType={overlayPositionType}
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            onClick={toggleDropdown}
                            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                            size="small"
                            variant="secondary"
                            className={cx(
                                "gd-edit-alert-trigger-mode-select__button s-alert-trigger-mode-select",
                                {
                                    "is-active": isOpen,
                                },
                            )}
                        >
                            {selectedOption ? intl.formatMessage({ id: selectedOption.title }) : ""}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-trigger-mode-select__list s-alert-trigger-mode-select-list"
                            items={options}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    title={intl.formatMessage({ id: i.item.title })}
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
