// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { INotificationChannelIdentifier, INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { Button, Dropdown, OverlayPositionType, SingleSelectListItem, UiListbox } from "@gooddata/sdk-ui-kit";

export interface IAlertDestinationSelectProps {
    id: string;
    selectedDestination: string;
    onDestinationChange: (destinationId: string) => void;
    destinations: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    overlayPositionType?: OverlayPositionType;
    closeOnParentScroll?: boolean;
}

export function AlertDestinationSelect({
    id,
    selectedDestination,
    onDestinationChange,
    destinations,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertDestinationSelectProps) {
    const intl = useIntl();
    const selectedOption = destinations.find((o) => o.id === selectedDestination);

    const accessibilityAriaLabel = intl.formatMessage({ id: "alert.accessibility.destination.label" });
    return (
        <Dropdown
            closeOnParentScroll={closeOnParentScroll}
            overlayPositionType={overlayPositionType}
            autofocusOnOpen={true}
            renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                return (
                    <Button
                        id={id}
                        accessibilityConfig={{
                            role: "button",
                            popupId: dropdownId,
                            isExpanded: isOpen,
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
                        ref={buttonRef}
                    >
                        {selectedOption?.title ?? " - "}
                    </Button>
                );
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const listboxItems = destinations.map((destination) => ({
                    type: "interactive" as const,
                    id: destination.id,
                    stringTitle: destination.title ?? "",
                    data: destination,
                }));

                return (
                    <UiListbox
                        shouldKeyboardActionStopPropagation={true}
                        shouldKeyboardActionPreventDefault={true}
                        dataTestId="s-alert-destination-select-list"
                        items={listboxItems}
                        selectedItemId={selectedDestination}
                        shouldCloseOnSelect={true}
                        onSelect={(item) => {
                            if (item.id !== selectedDestination) {
                                onDestinationChange(item.id);
                            }
                        }}
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                        InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                            return (
                                <SingleSelectListItem
                                    title={item.data.title}
                                    isSelected={isSelected}
                                    isFocused={isFocused}
                                    onClick={onSelect}
                                    className="gd-alert-destination-select__list-item"
                                />
                            );
                        }}
                    />
                );
            }}
        />
    );
}
