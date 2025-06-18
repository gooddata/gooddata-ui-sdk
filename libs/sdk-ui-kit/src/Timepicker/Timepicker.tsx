// (C) 2019-2025 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import moment from "moment";
import { translationUtils } from "@gooddata/util";
import { IntlWrapper } from "@gooddata/sdk-ui";
import noop from "lodash/noop.js";

import { OverlayPositionType } from "../typings/overlay.js";
import { Dropdown, DropdownButton } from "../Dropdown/index.js";
import { UiListbox } from "../@ui/UiListbox/UiListbox.js";

import { formatTime, normalizeTime, updateTime, HOURS_IN_DAY, TIME_ANCHOR } from "./utils/timeUtilities.js";
import { SelectedTime } from "./typings.js";
import { SingleSelectListItem } from "../List/index.js";

const DEFAULT_WIDTH = 199;
const MINUTES_IN_HOUR = 60;
const MAX_VISIBLE_ITEMS_COUNT = 10;
const MAX_HEIGHT = 140;

export { normalizeTime, formatTime };

/**
 * @internal
 */
export interface ITimepickerOwnProps {
    time: Date | null;
    className?: string;
    ariaLabelledBy?: string;
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

interface ITimePickerState {
    dropdownWidth: number;
    selectedTime: Date;
}

export class WrappedTimepicker extends React.PureComponent<TimePickerProps, ITimePickerState> {
    public dropdownRef = React.createRef<HTMLDivElement>();

    public static defaultProps = {
        className: "",
        maxVisibleItemsCount: MAX_VISIBLE_ITEMS_COUNT,
        time: new Date(),
        onChange: noop,
        overlayZIndex: 0,
        skipNormalizeTime: false,
        timeAnchor: TIME_ANCHOR,
        timeFormat: undefined,
    };

    constructor(props: TimePickerProps) {
        super(props);

        this.updateLocaleForMoment();

        const time = props.time || new Date();
        this.state = {
            dropdownWidth: DEFAULT_WIDTH,
            selectedTime: props.skipNormalizeTime
                ? time
                : normalizeTime(time, undefined, this.props.timeAnchor),
        };
    }

    public UNSAFE_componentWillReceiveProps(newProps: TimePickerProps): void {
        if (newProps.time !== this.props.time) {
            const updatedTime = newProps.time || new Date();
            this.setState({
                selectedTime: this.props.skipNormalizeTime
                    ? updatedTime
                    : normalizeTime(updatedTime, undefined, this.props.timeAnchor),
            });
        }
    }

    public componentDidMount(): void {
        this.updateDropdownWidth();
    }

    private getComponentClasses() {
        return `gd-datepicker ${this.props.className} gd-datepicker-input gd-timepicker`;
    }

    private getTimeItems = (selectedTime: SelectedTime) => {
        let currentItem;
        const items = [];

        const { h: hours, m: minutes } = selectedTime;

        for (let h = 0; h < HOURS_IN_DAY; h += 1) {
            for (let m = 0; m < MINUTES_IN_HOUR; m += this.props.timeAnchor) {
                const item = {
                    h,
                    m,
                    title: formatTime(h, m, this.props.timeFormat),
                };
                items.push(item);
                if (h === hours && m === minutes) {
                    currentItem = item;
                }
            }
        }

        return { items, currentItem };
    };

    private updateDropdownWidth = () => {
        const { width } = this.dropdownRef.current.getBoundingClientRect();
        this.setState({ dropdownWidth: width });
    };

    private updateLocaleForMoment() {
        moment.locale(translationUtils.sanitizeLocaleForMoment(this.props.intl.locale));
    }

    private handleTimeChanged = (newlySelectedTime: SelectedTime) => {
        if (!newlySelectedTime) {
            return;
        }

        const { h, m } = newlySelectedTime;
        const selectedTime = updateTime(h, m);

        this.setState({ selectedTime }, () => this.props.onChange(selectedTime));
    };

    public render() {
        const { ariaLabelledBy, overlayPositionType, overlayZIndex, intl, closeOnParentScroll } = this.props;
        const { dropdownWidth, selectedTime } = this.state;
        const time = {
            h: selectedTime.getHours(),
            m: selectedTime.getMinutes(),
        };
        const { items, currentItem } = this.getTimeItems(time);
        const accessibilityDropdownButtonLabel = intl.formatMessage({ id: "timePicker.accessibility.label" });

        return (
            <div className={this.getComponentClasses()} ref={this.dropdownRef}>
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
                                ariaLabel: accessibilityDropdownButtonLabel,
                            }}
                            value={formatTime(time.h, time.m, this.props.timeFormat)}
                            isOpen={isOpen}
                            dropdownId={dropdownId}
                            onClick={openDropdown}
                            iconLeft="gd-icon-timer"
                            buttonRef={buttonRef}
                        />
                    )}
                    renderBody={({ closeDropdown, ariaAttributes }) => {
                        const listboxItems = items.map((item) => ({
                            type: "interactive" as const,
                            id: `${item.h}-${item.m}`,
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
                                dataTestId="s-timepicker-list"
                                items={listboxItems}
                                maxWidth={dropdownWidth}
                                maxHeight={MAX_HEIGHT}
                                selectedItemId={currentItem ? `${currentItem.h}-${currentItem.m}` : undefined}
                                onSelect={(item) => {
                                    this.handleTimeChanged(item.data);
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
                    }}
                    overlayZIndex={overlayZIndex}
                />
            </div>
        );
    }
}

const TimePickerWithIntl = injectIntl(WrappedTimepicker);

/**
 * @internal
 */
export class Timepicker extends React.PureComponent<ITimepickerOwnProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <TimePickerWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
