// (C) 2024-2025 GoodData Corporation

import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
    Dropdown,
    DropdownButton,
    SingleSelectListItem,
    OverlayPositionType,
    UiListbox,
    IUiListboxInteractiveItem,
    Hyperlink,
} from "@gooddata/sdk-ui-kit";
import { DEFAULT_DROPDOWN_ALIGN_POINTS } from "../../constants.js";
import { INotificationChannelIdentifier, INotificationChannelMetadataObject } from "@gooddata/sdk-model";

const DROPDOWN_WIDTH = 199;

interface IDestinationItem {
    id: string;
    title: string;
}

interface IDestinationSelectProps {
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    selectedItemId: string | undefined;
    onChange: (selectedItemId: string) => void;
    closeOnParentScroll?: boolean;
    overlayPositionType?: OverlayPositionType;
}

export const DestinationSelect: React.FC<IDestinationSelectProps> = ({
    notificationChannels,
    selectedItemId,
    onChange,
    closeOnParentScroll,
    overlayPositionType,
}) => {
    const intl = useIntl();
    const items = useMemo(() => {
        return (
            notificationChannels?.map(
                (wh): IDestinationItem => ({
                    id: wh.id,
                    title: wh?.title ?? wh.id,
                }),
            ) ?? []
        );
    }, [notificationChannels]);

    const selectedItem = useMemo(() => {
        return items.find((item) => item.id === selectedItemId);
    }, [items, selectedItemId]);

    const accessibilityValue = "schedule.destination";

    return (
        <div className="gd-input-component gd-destination-field s-gd-notifications-channels-dialog-destination">
            <label htmlFor={accessibilityValue} className="gd-label">
                <FormattedMessage id="dialogs.schedule.email.destination" />
            </label>
            {items.length === 0 ? (
                <div className="gd-notifications-channels-dialog-destination-empty">
                    <span>
                        <span className="gd-icon-warning" />
                        <FormattedMessage id="dialogs.schedule.email.destination.missing" />
                    </span>
                    <Hyperlink
                        text={intl.formatMessage({ id: "dialogs.schedule.email.destination.help" })}
                        href="/settings"
                    />
                </div>
            ) : (
                <Dropdown
                    overlayPositionType={overlayPositionType}
                    closeOnParentScroll={closeOnParentScroll}
                    alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
                    className="gd-notifications-channels-dialog-destination s-gd-notifications-channels-dialog-destination"
                    autofocusOnOpen={true}
                    renderButton={({ toggleDropdown, dropdownId, isOpen, buttonRef }) => (
                        <DropdownButton
                            id={accessibilityValue}
                            value={selectedItem?.title}
                            onClick={toggleDropdown}
                            className="gd-notifications-channels-dialog-destination-button"
                            buttonRef={buttonRef as React.MutableRefObject<HTMLElement>}
                            dropdownId={dropdownId}
                            isOpen={isOpen}
                        />
                    )}
                    renderBody={({ closeDropdown, ariaAttributes }) => {
                        const listboxItems: IUiListboxInteractiveItem<IDestinationItem>[] = items.map(
                            (item) => ({
                                type: "interactive",
                                id: item.id,
                                stringTitle: item.title,
                                data: item,
                            }),
                        );
                        const handleKeyDown = (e: React.KeyboardEvent) => {
                            if (e.key !== "Tab") {
                                return;
                            }

                            closeDropdown();
                        };

                        return (
                            <UiListbox
                                shouldKeyboardActionStopPropagation={true}
                                shouldKeyboardActionPreventDefault={true}
                                className="s-gd-notifications-channels-dialog-destination-list"
                                dataTestId="s-gd-notifications-channels-dialog-destination-list"
                                items={listboxItems}
                                maxWidth={DROPDOWN_WIDTH}
                                selectedItemId={selectedItemId}
                                onSelect={(item) => {
                                    onChange(item.id);
                                }}
                                onUnhandledKeyDown={handleKeyDown}
                                onClose={closeDropdown}
                                ariaAttributes={ariaAttributes}
                                InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                                    return (
                                        <SingleSelectListItem
                                            title={item.stringTitle}
                                            isSelected={isSelected}
                                            isFocused={isFocused}
                                            onClick={onSelect}
                                            className="gd-notifications-channels-dialog-destination-list-item"
                                        />
                                    );
                                }}
                            />
                        );
                    }}
                />
            )}
        </div>
    );
};
