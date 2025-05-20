// (C) 2024-2025 GoodData Corporation
import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { Button, Dropdown, List, OverlayPositionType, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import React from "react";
import { useIntl } from "react-intl";
import { DROPDOWN_ITEM_HEIGHT } from "../constants.js";

export interface IAlertDestinationSelectProps {
    id: string;
    selectedDestination: string;
    onDestinationChange: (destinationId: string) => void;
    destinations: INotificationChannelMetadataObject[];
    overlayPositionType?: OverlayPositionType;
    closeOnParentScroll?: boolean;
}

export const AlertDestinationSelect: React.FC<IAlertDestinationSelectProps> = ({
    id,
    selectedDestination,
    onDestinationChange,
    destinations,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertDestinationSelectProps) => {
    const intl = useIntl();
    const selectedOption = destinations.find((o) => o.id === selectedDestination);

    const accessibilityAriaLabel = intl.formatMessage({ id: "alert.accessibility.destination.label" });
    return (
        <Dropdown
            closeOnParentScroll={closeOnParentScroll}
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
    );
};
