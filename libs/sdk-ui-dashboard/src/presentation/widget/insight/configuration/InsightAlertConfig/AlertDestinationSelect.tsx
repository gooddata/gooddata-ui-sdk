// (C) 2024 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { DROPDOWN_ITEM_HEIGHT, INotificationChannel } from "./constants.js";

export interface IAlertDestinationSelectProps {
    selectedDestination: string;
    onDestinationChange: (destinationId: string) => void;
    destinations: INotificationChannel[];
}

export const AlertDestinationSelect: React.FC<IAlertDestinationSelectProps> = ({
    selectedDestination,
    onDestinationChange,
    destinations,
}: IAlertDestinationSelectProps) => {
    const selectedOption = destinations.find((o) => o.id === selectedDestination);

    return (
        <div className="gd-alert-destination-select">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            onClick={toggleDropdown}
                            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                            size="small"
                            variant="primary"
                            className={cx(
                                "gd-alert-destination-select__button",
                                "button-dropdown",
                                "dropdown-button",
                                {
                                    "gd-alert-destination-select__button--open": isOpen,
                                    "is-active": isOpen,
                                },
                            )}
                        >
                            {selectedOption?.title}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-destination-select__list"
                            items={destinations}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    title={i.item.title}
                                    isSelected={i.item.id === selectedDestination}
                                    onClick={() => {
                                        if (i.item.id !== selectedDestination) {
                                            onDestinationChange(i.item.id);
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
