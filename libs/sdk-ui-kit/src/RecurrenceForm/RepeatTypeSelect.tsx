// (C) 2024-2025 GoodData Corporation

import React from "react";

import { IntlShape, MessageDescriptor, useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import {
    DEFAULT_DROPDOWN_ALIGN_POINTS,
    DEFAULT_DROPDOWN_WIDTH,
    DEFAULT_DROPDOWN_ZINDEX,
    RECURRENCE_TYPES,
} from "./constants.js";
import { messages } from "./locales.js";
import { RecurrenceType } from "./types.js";
import { getIntlDayName, getWeekNumber, isLastOccurrenceOfWeekdayInMonth } from "./utils/utils.js";
import { UiListbox } from "../@ui/UiListbox/UiListbox.js";
import { Dropdown, DropdownButton } from "../Dropdown/index.js";
import { SingleSelectListItem } from "../List/index.js";

interface IDropdownItem {
    id: RecurrenceType;
    title: string;
    info?: string;
}

const getLocalizationKey = (
    id: RecurrenceType,
): {
    title: MessageDescriptor;
    info?: MessageDescriptor;
} => {
    switch (id) {
        case RECURRENCE_TYPES.HOURLY:
            return {
                title: messages.recurrence_hourly,
            };
        case RECURRENCE_TYPES.DAILY:
            return {
                title: messages.recurrence_daily,
            };
        case RECURRENCE_TYPES.WEEKLY:
            return {
                title: messages.recurrence_weekly,
            };
        case RECURRENCE_TYPES.MONTHLY:
            return {
                title: messages.recurrence_monthly,
            };
        case RECURRENCE_TYPES.CRON:
            return {
                title: messages.recurrence_cron,
            };
        case RECURRENCE_TYPES.INHERIT:
            return {
                title: messages.recurrence_inherit,
                info: messages.recurrence_inherit_info,
            };
        default:
            throw new Error("Invariant: Unexpected localization key.");
    }
};

const getRepeatItems = (
    intl: IntlShape,
    startDate: Date | null,
    allowHourlyRecurrence?: boolean,
    showInheritValue?: boolean,
): IDropdownItem[] => {
    const isLastOccurrenceOfWeekDay = isLastOccurrenceOfWeekdayInMonth(startDate);
    const recurrenceTypes = [
        ...(showInheritValue ? [RECURRENCE_TYPES.INHERIT] : []),
        ...(allowHourlyRecurrence ? [RECURRENCE_TYPES.HOURLY] : []),
        RECURRENCE_TYPES.DAILY,
        RECURRENCE_TYPES.WEEKLY,
        RECURRENCE_TYPES.MONTHLY,
        RECURRENCE_TYPES.CRON,
    ];

    return recurrenceTypes.map((id): IDropdownItem => {
        const { title, info } = getLocalizationKey(id);

        if (id === RECURRENCE_TYPES.MONTHLY && !startDate) {
            return {
                id,
                title: intl.formatMessage(messages.recurrence_monthly_first),
            };
        }
        if (id === RECURRENCE_TYPES.WEEKLY && !startDate) {
            return {
                id,
                title: intl.formatMessage(messages.recurrence_weekly_first),
            };
        }

        if (id === RECURRENCE_TYPES.MONTHLY && isLastOccurrenceOfWeekDay) {
            return {
                id,
                title: intl.formatMessage(messages.recurrence_monthly_last, {
                    day: getIntlDayName(intl, startDate),
                }),
            };
        }

        return {
            id,
            title: intl.formatMessage(title, {
                day: getIntlDayName(intl, startDate),
                week: getWeekNumber(startDate),
            }),
            info: info ? intl.formatMessage(info) : undefined,
        };
    });
};

export interface IRepeatTypeSelectProps {
    id: string;
    repeatType: RecurrenceType;
    showInheritValue?: boolean;
    startDate?: Date | null;
    onChange: (repeatType: string) => void;
    allowHourlyRecurrence?: boolean;
    onRepeatDropdownOpen?: () => void;
    closeOnParentScroll?: boolean;
}

export const RepeatTypeSelect: React.FC<IRepeatTypeSelectProps> = (props) => {
    const {
        id,
        onChange,
        repeatType,
        startDate = null,
        allowHourlyRecurrence,
        showInheritValue,
        onRepeatDropdownOpen,
        closeOnParentScroll,
    } = props;
    const intl = useIntl();
    const repeatItems = getRepeatItems(intl, startDate, allowHourlyRecurrence, showInheritValue);
    const repeatTypeItem = repeatItems.find((item) => item.id === repeatType);

    invariant(repeatTypeItem, "Inconsistent state in RepeatTypeSelect");

    return (
        <Dropdown
            closeOnParentScroll={closeOnParentScroll}
            alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
            className="gd-recurrence-form-type s-recurrence-form-type"
            autofocusOnOpen={true}
            renderButton={({ toggleDropdown, isOpen, dropdownId, buttonRef }) => (
                <DropdownButton
                    id={id}
                    value={repeatTypeItem.title}
                    onClick={() => {
                        if (!isOpen) {
                            onRepeatDropdownOpen?.();
                        }
                        toggleDropdown();
                    }}
                    dropdownId={dropdownId}
                    isOpen={isOpen}
                    buttonRef={buttonRef}
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const listboxItems = repeatItems.map((item) => ({
                    type: "interactive" as const,
                    id: item.id,
                    stringTitle: item.title,
                    data: item,
                }));

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
                        dataTestId="s-recurrence-form-type-list"
                        items={listboxItems}
                        maxWidth={DEFAULT_DROPDOWN_WIDTH}
                        selectedItemId={repeatType}
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
                                    info={item.data.info}
                                    isSelected={isSelected}
                                    isFocused={isFocused}
                                    onClick={onSelect}
                                    className="gd-recurrence-form-list-item"
                                />
                            );
                        }}
                    />
                );
            }}
            overlayPositionType="sameAsTarget"
            overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
        />
    );
};
