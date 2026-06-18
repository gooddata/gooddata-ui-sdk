// (C) 2024-2026 GoodData Corporation

import { type MutableRefObject } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAlertAnomalyDetectionSensitivity } from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    type IUiListboxItem,
    type OverlayPositionType,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { messages } from "../messages.js";

const options: {
    title: string;
    id: IAlertAnomalyDetectionSensitivity;
}[] = [
    {
        title: messages.alertSensitivityLow.id,
        id: "LOW",
    },
    {
        title: messages.alertSensitivityMedium.id,
        id: "MEDIUM",
    },
    {
        title: messages.alertSensitivityHigh.id,
        id: "HIGH",
    },
];

export interface IAlertSensitivitySelectProps {
    id: string;
    selectedSensitivity: IAlertAnomalyDetectionSensitivity | undefined;
    onSensitivityChange: (sensitivity: IAlertAnomalyDetectionSensitivity) => void;
    overlayPositionType?: OverlayPositionType;
    closeOnParentScroll?: boolean;
}

export function AlertSensitivitySelect({
    id,
    selectedSensitivity = "MEDIUM",
    onSensitivityChange,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertSensitivitySelectProps) {
    const selectedOption = options.find((o) => o.id === selectedSensitivity);
    const intl = useIntl();

    return (
        <div className="gd-alert-sensitivity-select">
            <Dropdown
                closeOnParentScroll={closeOnParentScroll}
                overlayPositionType={overlayPositionType}
                autofocusOnOpen
                renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                    return (
                        <DropdownButton
                            id={id}
                            value={selectedOption ? intl.formatMessage({ id: selectedOption.title }) : ""}
                            onClick={toggleDropdown}
                            className={cx(
                                "gd-edit-alert-sensitivity-select__button s-alert-sensitivity-select",
                            )}
                            buttonRef={buttonRef as MutableRefObject<HTMLElement>}
                            dropdownId={dropdownId}
                            isOpen={isOpen}
                            accessibilityConfig={{
                                ariaExpanded: isOpen,
                                popupType: "listbox",
                            }}
                        />
                    );
                }}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    const listboxItems: IUiListboxItem<{
                        title: string;
                        id: IAlertAnomalyDetectionSensitivity;
                    }>[] = options.map((option) => ({
                        type: "interactive",
                        id: option.id,
                        stringTitle: intl.formatMessage({ id: option.title }),
                        data: option,
                    }));

                    return (
                        <UiListbox
                            shouldKeyboardActionStopPropagation
                            shouldKeyboardActionPreventDefault
                            dataTestId="s-alert-sensitivity-select-list"
                            items={listboxItems}
                            selectedItemId={selectedSensitivity}
                            onSelect={(item) => {
                                if (selectedSensitivity !== item.id) {
                                    onSensitivityChange(item.id as IAlertAnomalyDetectionSensitivity);
                                }
                            }}
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                                return (
                                    <SingleSelectListItem
                                        title={item.stringTitle}
                                        isSelected={isSelected}
                                        isFocused={isFocused}
                                        onClick={onSelect}
                                        className="gd-alert-sensitivity-select__list-item"
                                    />
                                );
                            }}
                        />
                    );
                }}
            />
        </div>
    );
}
