// (C) 2020-2022 GoodData Corporation
import React from "react";
import { v4 as uuid } from "uuid";
import debounce from "lodash/debounce";
import noop from "lodash/noop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import isValid from "date-fns/isValid";
import classNames from "classnames";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";
import { injectIntl, WrappedComponentProps } from "react-intl";
import MomentLocaleUtils from "react-day-picker/moment";
import DayPicker from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";

import { IAlignPoint } from "../typings/positioning";
import { getOptimalAlignment } from "../utils/overlay";
import { elementRegion } from "../utils/domUtilities";
import { DEFAULT_DATE_FORMAT } from "../constants/platform";

const DATEPICKER_OUTSIDE_DAY_SELECTOR = "DayPicker-Day--outside";

/**
 * @internal
 */
export interface IDatePickerOwnProps {
    date?: Date; // date value used to initialize date picker
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

function formatDate(date: Date, dateFormat: string): string {
    return format(date, dateFormat);
}

function parseDate(str: string, dateFormat: string): Date | undefined {
    try {
        const parsedDate: Date = parse(str, dateFormat, new Date());
        // parse only dates with 4-digit years. this mimics moment.js behavior - it parses only dates above 1900
        // this is to make sure that the picker input is not overwritten in the middle of writing the year with year "0002" when writing 2020.
        //
        // it's also necessary to parse only when the input string fully matches with the desired format
        // to make sure that the picker input is not overwritten in the middle of writing.
        // e.g, let's consider a case where dateFormat is "dd/MM/yyyy" and the DayPickerInput has already been filled with a valid string "13/09/2020",
        // then an user wants to change only the month "13/09/2020" -> "13/11/2020" by removing "09" and typing "11".
        // in such case the parsing should wait until the user completes typing "11" (otherwise if parsing is done right after the first "1" is typed,
        // the cursor automatically moves to the end of the string in the middle of writing, causing a bad experience for the user).
        if (
            isValid(parsedDate) &&
            parsedDate.getFullYear() >= 1000 &&
            str === formatDate(parsedDate, dateFormat)
        ) {
            return parsedDate;
        }
        return;
    } catch {
        return;
    }
}

export class WrappedDatePicker extends React.PureComponent<DatePickerProps, IDatePickerState> {
    private rootRef: HTMLElement;
    private datePickerContainer: HTMLElement;

    public static defaultProps = {
        className: "",
        date: new Date(),
        placeholder: "",
        onChange: noop,
        resetOnInvalidValue: false,
        size: "",
        tabIndex: 0,
        alignPoints: [{ align: "bl tl" }, { align: "br tr" }, { align: "tl bl" }, { align: "tr br" }],
        onAlign: noop,
        dateFormat: DEFAULT_DATE_FORMAT,
    };
    constructor(props: DatePickerProps) {
        super(props);

        const { alignPoints } = props;

        this.state = {
            align: alignPoints[0].align,
            selectedDate: undefined,
            focused: false,
        };

        this.handleDayChanged = this.handleDayChanged.bind(this);
        this.handleInputChanged = this.handleInputChanged.bind(this);
        this.alignDatePicker = this.alignDatePicker.bind(this);
        this.setComponentRef = this.setComponentRef.bind(this);
        this.setDatepickerRef = this.setDatepickerRef.bind(this);
    }

    public componentDidMount(): void {
        const { date } = this.props;

        this.setState({ selectedDate: this.updateDate(date || new Date()) });
        window.addEventListener("resize", this.resizeHandler);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: DatePickerProps): void {
        const { props } = this;
        if (props.date > nextProps.date || props.date < nextProps.date) {
            const selectedDate = this.updateDate(nextProps.date);
            this.setState({ selectedDate });
        }
    }

    public componentDidUpdate(_prevProps: DatePickerProps, prevState: IDatePickerState): void {
        if (this.state.focused && !prevState.focused) {
            this.alignDatePicker();
        }
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.resizeHandler);
    }

    private setComponentRef(ref: HTMLElement) {
        this.rootRef = ref;
    }

    private setDatepickerRef(ref: DayPicker) {
        this.datePickerContainer = ref ? ref.dayPicker.parentElement : null;
    }

    private getInputClasses() {
        return classNames("input-text", "small-12", this.props.size, `gd-datepicker-input-${uuid()}`);
    }

    private getComponentClasses() {
        return classNames(
            "gd-datepicker",
            this.props.className,
            this.props.size,
            "gd-datepicker-input",
            this.state.focused ? "gd-datepicker-focused" : "",
        );
    }

    private getOverlayWrapperClasses() {
        const [inputAnchorPoint, pickerAnchorPoint] = this.state.align.split(" ");

        return classNames(
            "gd-datepicker-OverlayWrapper",
            `gd-datepicker-OverlayWrapper-${inputAnchorPoint}-xx`,
            `gd-datepicker-OverlayWrapper-xx-${pickerAnchorPoint}`,
        );
    }

    resizeHandler = debounce(() => this.alignDatePicker(), 100);

    private updateDate(date: Date) {
        return this.normalizeDate(date);
    }

    private handleInputChanged(e: React.MouseEvent<HTMLInputElement>) {
        const { value } = e.target as HTMLInputElement;
        const parsedDate = parseDate(value, this.props.dateFormat);

        if (parsedDate) {
            this.setState(
                {
                    selectedDate: parsedDate,
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
                    selectedDate: this.state.selectedDate,
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

    private handleDayChanged(newlySelectedDate: Date) {
        if (!newlySelectedDate) {
            return;
        }

        if (DayPicker.DateUtils.isSameDay(this.state.selectedDate, newlySelectedDate)) {
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

    private normalizeDate(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private alignDatePicker() {
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

    private handleWrapperClick(e: React.MouseEvent<HTMLDivElement>) {
        const { classList } = e.target as HTMLInputElement;
        /**
         * Prevent default fixes bug BB-332 but prevents in closing other dropdowns (Bug BB-1102)
         * so we want to prevent default only when clicking on outside dates in datepicker
         */
        if (e.target && classList && classList.contains(DATEPICKER_OUTSIDE_DAY_SELECTOR)) {
            e.preventDefault();
        }
    }

    public render() {
        const { dateFormat } = this.props;
        const classNamesProps = {
            overlay: "gd-datepicker-picker",
            overlayWrapper: this.getOverlayWrapperClasses(),
            container: "",
        };
        const dayPickerProps = {
            showOutsideDays: true,
            locale: translationUtils.sanitizeLocaleForMoment(this.props.intl.locale),
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
                    format={dateFormat}
                    placeholder={this.props.placeholder}
                />
                <span className="gd-datepicker-icon gd-icon-calendar" />
            </div>
        );
    }
}

const DatePickerWithIntl = injectIntl(WrappedDatePicker);

/**
 * @internal
 */
export class Datepicker extends React.PureComponent<IDatePickerOwnProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <DatePickerWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
