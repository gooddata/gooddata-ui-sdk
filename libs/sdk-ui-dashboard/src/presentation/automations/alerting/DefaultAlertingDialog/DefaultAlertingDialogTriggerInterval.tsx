// (C) 2024-2026 GoodData Corporation

import { type MutableRefObject, type ReactElement } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAlertTriggerInterval } from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    type IUiListboxItem,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { type IAlertingDialogTriggerIntervalProps } from "../types.js";

import { messages } from "./messages.js";

const options: {
    title: string;
    id: IAlertTriggerInterval;
}[] = [
    {
        title: messages.alertTriggerIntervalDay.id,
        id: "DAY",
    },
    {
        title: messages.alertTriggerIntervalWeek.id,
        id: "WEEK",
    },
    {
        title: messages.alertTriggerIntervalMonth.id,
        id: "MONTH",
    },
    {
        title: messages.alertTriggerIntervalQuarter.id,
        id: "QUARTER",
    },
    {
        title: messages.alertTriggerIntervalYear.id,
        id: "YEAR",
    },
];

/**
 * Default render of the alerting dialog's trigger-interval field: the dropdown selecting the
 * interval of a once-per-interval trigger. Props-driven — the bare control without its label;
 * reads no dialog context (only `useIntl`). The default dialog and
 * {@link AlertingDialogTriggerInterval} render it with {@link useAlertingDialogTriggerIntervalProps}
 * inside {@link AutomationDialogFormField}.
 *
 * @alpha
 */
export function DefaultAlertingDialogTriggerInterval({
    id,
    selectedTriggerInterval,
    onTriggerIntervalChange,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertingDialogTriggerIntervalProps): ReactElement {
    const selectedOption = options.find((o) => o.id === selectedTriggerInterval);
    const intl = useIntl();

    return (
        <div className="gd-alert-trigger-interval-select">
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
                                "gd-edit-alert-trigger-interval-select__button s-alert-trigger-interval-select",
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
                    const listboxItems: IUiListboxItem<{ title: string; id: IAlertTriggerInterval }>[] =
                        options.map((option) => ({
                            type: "interactive",
                            id: option.id,
                            stringTitle: intl.formatMessage({ id: option.title }),
                            data: option,
                        }));

                    return (
                        <UiListbox
                            shouldKeyboardActionStopPropagation
                            shouldKeyboardActionPreventDefault
                            dataTestId="s-alert-trigger-interval-select-list"
                            items={listboxItems}
                            selectedItemId={selectedTriggerInterval}
                            onSelect={(item) => {
                                if (selectedTriggerInterval !== item.id) {
                                    onTriggerIntervalChange(item.id as IAlertTriggerInterval);
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
                                        className="gd-alert-trigger-interval-select__list-item"
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
