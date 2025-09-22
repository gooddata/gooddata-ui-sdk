// (C) 2019-2025 GoodData Corporation

import { KeyboardEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import moment from "moment";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";

import { SelectedTime } from "./typings.js";
import { HOURS_IN_DAY, TIME_ANCHOR, formatTime, normalizeTime, updateTime } from "./utils/timeUtilities.js";
import { UiListbox } from "../@ui/UiListbox/UiListbox.js";
import { Dropdown, DropdownButton } from "../Dropdown/index.js";
import { SingleSelectListItem } from "../List/index.js";
import { OverlayPositionType } from "../typings/overlay.js";

const DEFAULT_WIDTH = 199;
const MINUTES_IN_HOUR = 60;
const MAX_HEIGHT = 140;

export { normalizeTime, formatTime };

/**
 * @internal
 */
export interface ITimepickerOwnProps {
    time: Date | null;
    className?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    maxVisibleItemsCount?: number;
    onChange?: (selectedTime: Date) => void;
    overlayPositionType?: OverlayPositionType;
    overlayZIndex?: number;
    locale?: string;
    skipNormalizeTime?: boolean;
    timeAnchor?: number;
    timeFormat?: string;
    closeOnParentScroll?: boolean;
}

export type TimePickerProps = ITimepickerOwnProps & WrappedComponentProps;

export const WrappedTimepicker = memo(function WrappedTimepicker({
    time = new Date(),
    className = "",
    ariaLabelledBy,
    ariaDescribedBy,
    onChange = () => {},
    overlayPositionType,
    overlayZIndex = 0,
    skipNormalizeTime = false,
    timeAnchor = TIME_ANCHOR,
    timeFormat = undefined,
    closeOnParentScroll,
    intl,
}: TimePickerProps) {
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const updateLocaleForMoment = useCallback(() => {
        moment.locale(translationUtils.sanitizeLocaleForMoment(intl.locale));
    }, [intl.locale]);

    updateLocaleForMoment();

    const initialTime = time || new Date();
    const [dropdownWidth, setDropdownWidth] = useState(DEFAULT_WIDTH);
    const [selectedTime, setSelectedTime] = useState<Date>(
        skipNormalizeTime ? initialTime : normalizeTime(initialTime, undefined, timeAnchor),
    );

    useEffect(() => {
        const updatedTime = time || new Date();
        const newSelectedTime = skipNormalizeTime
            ? updatedTime
            : normalizeTime(updatedTime, undefined, timeAnchor);

        if (newSelectedTime.getTime() !== selectedTime.getTime()) {
            setSelectedTime(newSelectedTime);
        }
    }, [time, skipNormalizeTime, timeAnchor, selectedTime]);

    const updateDropdownWidth = useCallback(() => {
        const { width } = dropdownRef.current.getBoundingClientRect();
        setDropdownWidth(width);
    }, []);

    useEffect(() => {
        updateDropdownWidth();
    }, [updateDropdownWidth]);

    const getComponentClasses = useCallback(() => {
        return `gd-datepicker ${className} gd-datepicker-input gd-timepicker`;
    }, [className]);

    const getTimeItems = useCallback(
        (selectedTime: SelectedTime) => {
            let currentItem;
            const items = [];

            const { h: hours, m: minutes } = selectedTime;

            for (let h = 0; h < HOURS_IN_DAY; h += 1) {
                for (let m = 0; m < MINUTES_IN_HOUR; m += timeAnchor) {
                    const item = {
                        h,
                        m,
                        title: formatTime(h, m, timeFormat),
                    };
                    items.push(item);
                    if (h === hours && m === minutes) {
                        currentItem = item;
                    }
                }
            }

            return { items, currentItem };
        },
        [timeAnchor, timeFormat],
    );

    const handleTimeChanged = useCallback(
        (newlySelectedTime: SelectedTime) => {
            if (!newlySelectedTime) {
                return;
            }

            const { h, m } = newlySelectedTime;
            const newSelectedTime = updateTime(h, m);

            setSelectedTime(newSelectedTime);
            onChange(newSelectedTime);
        },
        [onChange],
    );

    const timeObj = useMemo(
        () => ({
            h: selectedTime.getHours(),
            m: selectedTime.getMinutes(),
        }),
        [selectedTime],
    );
    const { items, currentItem } = useMemo(() => getTimeItems(timeObj), [getTimeItems, timeObj]);
    const accessibilityDropdownButtonLabel = intl.formatMessage({ id: "timePicker.accessibility.label" });

    return (
        <div className={getComponentClasses()} ref={dropdownRef}>
            <Dropdown
                closeOnParentScroll={closeOnParentScroll}
                overlayPositionType={overlayPositionType}
                alignPoints={[
                    {
                        align: "bl tl",
                    },
                    {
                        align: "tl bl",
                    },
                ]}
                autofocusOnOpen={true}
                renderButton={({ openDropdown, isOpen, dropdownId, buttonRef }) => (
                    <DropdownButton
                        accessibilityConfig={{
                            ariaLabelledBy,
                            ariaDescribedBy,
                            ariaLabel: accessibilityDropdownButtonLabel,
                        }}
                        value={formatTime(timeObj.h, timeObj.m, timeFormat)}
                        isOpen={isOpen}
                        dropdownId={dropdownId}
                        onClick={openDropdown}
                        iconLeft="gd-icon-timer"
                        buttonRef={buttonRef}
                    />
                )}
                renderBody={useCallback(
                    ({ closeDropdown, ariaAttributes }) => {
                        const listboxItems = items.map((item) => ({
                            type: "interactive" as const,
                            id: `${item.h}-${item.m}`,
                            stringTitle: item.title,
                            data: item,
                        }));

                        const handleKeyDown = (e: KeyboardEvent) => {
                            if (e.key !== "Tab") {
                                return;
                            }

                            closeDropdown();
                        };

                        return (
                            <UiListbox
                                shouldKeyboardActionStopPropagation={true}
                                shouldKeyboardActionPreventDefault={true}
                                dataTestId="s-timepicker-list"
                                items={listboxItems}
                                maxWidth={dropdownWidth}
                                maxHeight={MAX_HEIGHT}
                                selectedItemId={currentItem ? `${currentItem.h}-${currentItem.m}` : undefined}
                                onSelect={(item) => {
                                    handleTimeChanged(item.data);
                                }}
                                onClose={closeDropdown}
                                onUnhandledKeyDown={handleKeyDown}
                                ariaAttributes={ariaAttributes}
                                InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                                    return (
                                        <SingleSelectListItem
                                            title={item.stringTitle}
                                            isSelected={isSelected}
                                            isFocused={isFocused}
                                            onClick={onSelect}
                                            className="gd-timepicker-list-item"
                                        />
                                    );
                                }}
                            />
                        );
                    },
                    [items, handleTimeChanged, currentItem, dropdownWidth],
                )}
                overlayZIndex={overlayZIndex}
            />
        </div>
    );
});

const TimePickerWithIntl = injectIntl(WrappedTimepicker);

/**
 * @internal
 */
export const Timepicker = memo(function Timepicker(props: ITimepickerOwnProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <TimePickerWithIntl {...props} />
        </IntlWrapper>
    );
});
