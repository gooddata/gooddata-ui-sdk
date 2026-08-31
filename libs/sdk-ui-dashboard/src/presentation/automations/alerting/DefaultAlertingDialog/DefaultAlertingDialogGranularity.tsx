// (C) 2024-2026 GoodData Corporation

import { type MutableRefObject, type ReactElement } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAlertAnomalyDetectionGranularity } from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    type IUiListboxItem,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { type IAlertingDialogGranularityProps } from "../types.js";

import { messages } from "./messages.js";

const options: {
    title: string;
    id: IAlertAnomalyDetectionGranularity;
}[] = [
    {
        title: messages.alertGranularityHour.id,
        id: "HOUR",
    },
    {
        title: messages.alertGranularityDay.id,
        id: "DAY",
    },
    {
        title: messages.alertGranularityWeek.id,
        id: "WEEK",
    },
    {
        title: messages.alertGranularityMonth.id,
        id: "MONTH",
    },
    {
        title: messages.alertGranularityQuarter.id,
        id: "QUARTER",
    },
    {
        title: messages.alertGranularityYear.id,
        id: "YEAR",
    },
];

/**
 * Default render of the alerting dialog's granularity field: the dropdown selecting the
 * anomaly-detection granularity. Props-driven — the bare control without its label; reads no
 * dialog context (only `useIntl`). The default dialog and {@link AlertingDialogGranularity} render
 * it with {@link useAlertingDialogGranularityProps} inside {@link AutomationDialogFormField}.
 *
 * @alpha
 */
export function DefaultAlertingDialogGranularity({
    id,
    allowHourlyRecurrence,
    selectedGranularity = "WEEK",
    onGranularityChange,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertingDialogGranularityProps): ReactElement {
    const usableOptions = options.filter((o) => {
        if (!allowHourlyRecurrence) {
            return o.id !== "HOUR";
        }
        return true;
    });
    const selectedOption = usableOptions.find((o) => o.id === selectedGranularity);
    const intl = useIntl();

    return (
        <div className="gd-alert-granularity-select">
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
                                "gd-edit-alert-granularity-select__button s-alert-granularity-select",
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
                        id: IAlertAnomalyDetectionGranularity;
                    }>[] = usableOptions.map((option) => ({
                        type: "interactive",
                        id: option.id,
                        stringTitle: intl.formatMessage({ id: option.title }),
                        data: option,
                    }));

                    return (
                        <UiListbox
                            shouldKeyboardActionStopPropagation
                            shouldKeyboardActionPreventDefault
                            dataTestId="s-alert-granularity-select-list"
                            items={listboxItems}
                            selectedItemId={selectedGranularity}
                            onSelect={(item) => {
                                if (selectedGranularity !== item.id) {
                                    onGranularityChange(item.id as IAlertAnomalyDetectionGranularity);
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
                                        className="gd-alert-granularity-select__list-item"
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
