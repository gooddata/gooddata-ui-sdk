// (C) 2020 GoodData Corporation
import React from "react";
import uniqueId from "lodash/uniqueId";
import debounce from "lodash/debounce";
import moment from "moment";
import classNames from "classnames";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { injectIntl, WrappedComponentProps } from "react-intl";
import MomentLocaleUtils from "react-day-picker/moment";
import DateUtils from "react-day-picker";
import DayPicker from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";

import { IAlignPoint } from "../typings/positioning";
import { getOptimalAlignment } from "./utils/overlay";
import { elementRegion } from "../utils/domUtilities";
import { mapChineseLocaleForMoment } from "../utils/localeUtilities";

const DATEPICKER_OUTSIDE_DAY_SELECTOR = "DayPicker-Day--outside";

/**
 * @internal
 */
export interface IDatePickerOwnProps {
    date: Date | null; // date value used to initialize date picker
    className?: string; // optional css applied to outer div
    placeholder?: string;
    onChange?: (selectedData: Date) => void; // called when selected date changes
    resetOnInvalidValue?: boolean; // reset on invalid input
    size?: string; // optional css class, applied to outer div and input
    tabIndex?: number;
    alignPoints?: IAlignPoint[];
    onAlign?: (align: string) => void;
    locale?: string;
    dateFormat?: string;
}

export type DatePickerProps = IDatePickerOwnProps & WrappedComponentProps;

interface IDatePickerState {
    align: string;
    selectedDate: Date;
    focused: boolean;
}

function formatDate(date: Date, format: string, locale: string): string {
    return moment(date).locale(locale).format(format);
}

function parseDate(str: string, format: string, locale: string): Date | void {
    const result = moment(str, format, locale, true);

    if (result.isValid()) {
        return result.toDate();
    }

    return;
}
class WrappedDatePicker extends React.PureComponent<DatePickerProps, IDatePickerState> {
    private rootRef: HTMLElement;
    private datePickerContainer: HTMLElement;

    static defaultProps = {
        className: "",
        date: new Date(),
        placeholder: "",
        onChange: () => {},
        resetOnInvalidValue: false,
        size: "",
        tabIndex: 0,
        alignPoints: [{ align: "bl tl" }, { align: "br tr" }, { align: "tl bl" }, { align: "tr br" }],
        onAlign: () => {},
    };
    constructor(props: DatePickerProps) {
        super(props);

        const { alignPoints } = props;

        this.state = {
            align: alignPoints[0].align,
            selectedDate: null,
            focused: false,
        };

        this.handleDayChanged = this.handleDayChanged.bind(this);
        this.handleInputChanged = this.handleInputChanged.bind(this);
        this.alignDatePicker = this.alignDatePicker.bind(this);
        this.setComponentRef = this.setComponentRef.bind(this);
        this.setDatepickerRef = this.setDatepickerRef.bind(this);
    }

    componentDidMount() {
        const { date, intl } = this.props;

        this.setState({ selectedDate: this.updateDate(date || new Date(), intl.locale) });
        window.addEventListener("resize", this.resizeHandler);
    }

    UNSAFE_componentWillReceiveProps(nextProps: DatePickerProps) {
        const { props } = this;
        if (props.date > nextProps.date || props.date < nextProps.date || props.intl !== nextProps.intl) {
            const selectedDate = this.updateDate(nextProps.date, nextProps.intl.locale);
            this.setState({ selectedDate });
        }
    }

    componentDidUpdate(_prevProps: DatePickerProps, prevState: IDatePickerState) {
        if (this.state.focused && !prevState.focused) {
            this.alignDatePicker();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeHandler);
    }

    setComponentRef(ref: HTMLElement) {
        this.rootRef = ref;
    }

    setDatepickerRef(ref: DayPicker) {
        this.datePickerContainer = ref ? ref.dayPicker.parentElement : null;
    }

    getInputClasses() {
        return classNames("input-text", "small-12", this.props.size, uniqueId("gd-datepicker-input-"));
    }

    getComponentClasses() {
        return classNames(
            "gd-datepicker",
            this.props.className,
            this.props.size,
            "gd-datepicker-input",
            this.state.focused ? "gd-datepicker-focused" : "",
        );
    }

    getOverlayWrapperClasses() {
        const [inputAnchorPoint, pickerAnchorPoint] = this.state.align.split(" ");

        return classNames(
            "gd-datepicker-OverlayWrapper",
            `gd-datepicker-OverlayWrapper-${inputAnchorPoint}-xx`,
            `gd-datepicker-OverlayWrapper-xx-${pickerAnchorPoint}`,
        );
    }

    resizeHandler = debounce(() => this.alignDatePicker(), 100);

    updateDate(date: Date, locale: string) {
        moment.locale(mapChineseLocaleForMoment(locale));

        return this.normalizeDate(date);
    }

    handleInputChanged(e: React.MouseEvent<HTMLInputElement>) {
        const { value } = e.target as HTMLInputElement;
        const momentDate = moment(value, "l", true);

        if (momentDate.isValid()) {
            this.setState(
                {
                    selectedDate: momentDate.toDate(),
                    focused: false,
                },
                () => {
                    this.props.onChange(this.state.selectedDate);
                },
            );
        } else {
            if (this.props.resetOnInvalidValue) {
                this.setState({
                    focused: false,
                    selectedDate: moment(this.state.selectedDate).toDate(),
                });
                return;
            }

            this.setState(
                {
                    focused: false,
                },
                () => {
                    this.props.onChange(null);
                },
            );
        }
    }

    handleDayChanged(newlySelectedDate: Date) {
        if (!newlySelectedDate) {
            return;
        }

        if (DateUtils.DateUtils.isSameDay(this.state.selectedDate, newlySelectedDate)) {
            return;
        }

        this.setState(
            {
                selectedDate: newlySelectedDate,
            },
            () => {
                this.props.onChange(newlySelectedDate);
            },
        );
    }

    normalizeDate(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    alignDatePicker() {
        const { alignPoints } = this.props;
        const container = this.datePickerContainer;

        if (!alignPoints || !container) return;

        const optimalAlignment = getOptimalAlignment({
            targetRegion: elementRegion(this.rootRef),
            selfRegion: elementRegion(container),
            alignPoints,
        });
        const { align } = optimalAlignment.alignment;

        this.setState(
            {
                align,
            },
            () => {
                this.props.onAlign(align);
            },
        );
    }

    handleWrapperClick(e: React.MouseEvent<HTMLDivElement>) {
        const { classList } = e.target as HTMLInputElement;
        /**
         * Prevent default fixes bug BB-332 but prevents in closing other dropdowns (Bug BB-1102)
         * so we want to prevent default only when clicking on outside dates in datepicker
         */
        if (e.target && classList && classList.contains(DATEPICKER_OUTSIDE_DAY_SELECTOR)) {
            e.preventDefault();
        }
    }

    render() {
        const classNamesProps = {
            overlay: "gd-datepicker-picker",
            overlayWrapper: this.getOverlayWrapperClasses(),
            container: "",
        };
        const dayPickerProps = {
            showOutsideDays: true,
            locale: mapChineseLocaleForMoment(this.props.intl.locale),
            localeUtils: MomentLocaleUtils,
            month: this.state.selectedDate,
            ref: this.setDatepickerRef,
        };
        const inputProps = {
            className: this.getInputClasses(),
            onBlur: this.handleInputChanged,
            tabIndex: this.props.tabIndex,
            onClick: () => {
                this.setState({ focused: true });
            },
            onFocus: () => {
                this.setState({ focused: true });
            },
        };

        return (
            <div
                className={this.getComponentClasses()}
                ref={this.setComponentRef}
                onClick={this.handleWrapperClick}
            >
                <DayPickerInput
                    classNames={classNamesProps}
                    value={this.state.selectedDate}
                    onDayChange={this.handleDayChanged}
                    dayPickerProps={dayPickerProps}
                    inputProps={inputProps}
                    formatDate={formatDate}
                    parseDate={parseDate}
                    format="L"
                    placeholder={this.props.placeholder}
                />
                <span className="gd-datepicker-icon icon-calendar" />
            </div>
        );
    }
}

const DatePickerWithIntl = injectIntl(WrappedDatePicker);

/**
 * @internal
 */
export class Datepicker extends React.PureComponent<IDatePickerOwnProps> {
    public render(): React.ReactNode {
        return (
            <IntlWrapper locale={this.props.locale}>
                <DatePickerWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
