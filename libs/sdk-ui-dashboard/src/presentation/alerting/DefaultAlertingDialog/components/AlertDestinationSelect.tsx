// (C) 2024-2025 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem, OverlayPositionType } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { DROPDOWN_ITEM_HEIGHT } from "../constants.js";
import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";

export interface IAlertDestinationSelectProps {
    id: string;
    selectedDestination: string;
    onDestinationChange: (destinationId: string) => void;
    destinations: INotificationChannelMetadataObject[];
    overlayPositionType?: OverlayPositionType;
}

export const AlertDestinationSelect: React.FC<IAlertDestinationSelectProps> = ({
    id,
    selectedDestination,
    onDestinationChange,
    destinations,
    overlayPositionType,
}: IAlertDestinationSelectProps) => {
    const intl = useIntl();
    const selectedOption = destinations.find((o) => o.id === selectedDestination);

    const accessibilityAriaLabel = intl.formatMessage({ id: "alert.accessibility.destination.label" });
    return (
        <div className="gd-alert-destination-select">
            <Dropdown
                overlayPositionType={overlayPositionType}
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            id={id}
                            accessibilityConfig={{
                                ariaLabel: accessibilityAriaLabel,
                            }}
                            onClick={toggleDropdown}
                            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                            size="small"
                            variant="primary"
                            className={cx(
                                "gd-alert-destination-select__button s-alert-destination-select",
                                "button-dropdown",
                                "dropdown-button",
                                {
                                    "gd-alert-destination-select__button--open": isOpen,
                                    "is-active": isOpen,
                                },
                            )}
                        >
                            {selectedOption?.title ?? " - "}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-destination-select__list s-alert-destination-select-list"
                            items={destinations}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    title={i.item?.title}
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
