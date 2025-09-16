// (C) 2020-2025 GoodData Corporation

import {
    ChangeEvent,
    FocusEvent,
    PureComponent,
    KeyboardEvent as ReactKeyboardEvent,
    MouseEvent as ReactMouseEvent,
    ReactNode,
    createRef,
} from "react";

import classNames from "classnames";
import { Locale, format, isSameDay, isValid, parse } from "date-fns";
import {
    de,
    enAU,
    enGB,
    enUS,
    es,
    fi,
    fr,
    frCA,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ptBR,
    ru,
    tr,
    zhCN,
} from "date-fns/locale";
import debounce from "lodash/debounce.js";
import noop from "lodash/noop.js";
import { ClassNames, DayEventHandler, DayPicker, DayPickerProps } from "react-day-picker";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { WeekStart } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { DEFAULT_DATE_FORMAT } from "../constants/platform.js";
import { IAccessibilityConfigBase } from "../typings/accessibility.js";
import { IAlignPoint } from "../typings/positioning.js";
import { elementRegion } from "../utils/domUtilities.js";
import { isEnterKey } from "../utils/events.js";
import { getOptimalAlignment } from "../utils/overlay.js";

const DATEPICKER_OUTSIDE_DAY_SELECTOR = "rdp-outside";

/**
 * @internal
 */
export interface IDatePickerOwnProps {
    accessibilityConfig?: IAccessibilityConfigBase;
    date?: Date; // date value used to initialize date picker
    className?: string; // optional css applied to outer div
    placeholder?: string;
    onChange?: (selectedData: Date) => void; // called when selected date changes
    onBlur?: (selectedDate: string) => void;
    onValidateInput?: (value: string) => void;
    resetOnInvalidValue?: boolean; // reset on invalid input
    size?: string; // optional css class, applied to outer div and input
    tabIndex?: number;
    alignPoints?: IAlignPoint[];
    onAlign?: (align: string) => void;
    locale?: string;
    dateFormat?: string;
    weekStart?: WeekStart;
    onDateInputKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
}

export type DatePickerProps = IDatePickerOwnProps & WrappedComponentProps;

interface IDatePickerState {
    align: string;
    selectedDate: Date | undefined;
    monthDate: Date | undefined;
    isOpen: boolean;
    inputValue: string;
}

const convertedLocales: Record<string, Locale> = {
    "en-US": enUS,
    "de-DE": de,
    "es-ES": es,
    "fr-FR": fr,
    "ja-JP": ja,
    "nl-NL": nl,
    "pt-BR": ptBR,
    "pt-PT": pt,
    "zh-Hans": zhCN,
    "ru-RU": ru,
    "it-IT": it,
    "es-419": es,
    "en-GB": enGB,
    "fr-CA": frCA,
    "zh-Hant": zhCN,
    "zh-HK": zhCN,
    "en-AU": enAU,
    "fi-FI": fi,
    "tr-TR": tr,
    "pl-PL": pl,
    "ko-KR": ko,
};

function formatDate(date: Date, dateFormat: string): string {
    return format(date, dateFormat);
}

function convertLocale(locale: string): Locale {
    return convertedLocales[locale];
}

export function parseDate(str: string, dateFormat: string): Date | undefined {
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
        return undefined;
    } catch {
        return undefined;
    }
}

function convertWeekStart(weekStart: WeekStart): DayPickerProps["weekStartsOn"] {
    switch (weekStart) {
        case "Sunday":
            return 0;
        case "Monday":
            return 1;
        default:
            throw new Error(`Unknown week start ${weekStart}`);
    }
}

export class WrappedDatePicker extends PureComponent<DatePickerProps, IDatePickerState> {
    private rootRef: HTMLElement;
    private datePickerContainerRef = createRef<HTMLDivElement>();
    private inputRef = createRef<HTMLInputElement>();

    private datePickerId = uuid();

    public static defaultProps = {
        className: "",
        date: new Date(),
        placeholder: "",
        onChange: noop,
        onBlur: noop,
        resetOnInvalidValue: false,
        size: "",
        tabIndex: 0,
        alignPoints: [{ align: "bl tl" }, { align: "br tr" }, { align: "tl bl" }, { align: "tr br" }],
        onAlign: noop,
        dateFormat: DEFAULT_DATE_FORMAT,
        weekStart: "Sunday" as const,
    };
    constructor(props: DatePickerProps) {
        super(props);

        const { alignPoints, date, dateFormat } = props;

        this.state = {
            align: alignPoints[0].align,
            selectedDate: date,
            monthDate: date,
            inputValue: formatDate(date || new Date(), dateFormat),
            isOpen: false,
        };

        this.handleDayChanged = this.handleDayChanged.bind(this);
        this.handleMonthChanged = this.handleMonthChanged.bind(this);
        this.handleInputChanged = this.handleInputChanged.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.alignDatePicker = this.alignDatePicker.bind(this);
        this.setComponentRef = this.setComponentRef.bind(this);
        this.handleWrapperClick = this.handleWrapperClick.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleCustomDayClick = this.handleCustomDayClick.bind(this);
    }

    public override componentDidMount(): void {
        const { date, dateFormat } = this.props;

        this.setState({ selectedDate: this.updateDate(date || new Date()) });
        this.setState({ inputValue: formatDate(date || new Date(), dateFormat) });
        window.addEventListener("resize", this.resizeHandler);
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    public override UNSAFE_componentWillReceiveProps(nextProps: DatePickerProps): void {
        const { props } = this;

        if (props.date > nextProps.date || props.date < nextProps.date) {
            const selectedDate = this.updateDate(nextProps.date || new Date());
            this.setState({ selectedDate });
            this.setState({ monthDate: selectedDate });
            this.setState({ inputValue: formatDate(selectedDate, props.dateFormat) });
        }
    }

    public override componentWillUnmount(): void {
        window.removeEventListener("resize", this.resizeHandler);
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    private handleClickOutside(event: MouseEvent) {
        if (
            this.datePickerContainerRef.current &&
            !this.datePickerContainerRef.current.contains(event.target as Node) &&
            this.inputRef &&
            !this.inputRef.current.contains(event.target as Node)
        ) {
            this.setState({ isOpen: false });
        }
    }

    public override componentDidUpdate(_prevProps: DatePickerProps, prevState: IDatePickerState): void {
        if (this.state.isOpen && !prevState.isOpen) {
            this.alignDatePicker();
        }
    }

    private setComponentRef(ref: HTMLElement) {
        this.rootRef = ref;
    }

    private getInputClasses() {
        return classNames(
            "input-text",
            "small-12",
            this.props.size,
            `gd-datepicker-input-${this.datePickerId}`,
        );
    }

    private getComponentClasses() {
        return classNames(
            "gd-datepicker",
            this.props.className,
            this.props.size,
            "gd-datepicker-input",
            this.state.isOpen ? "gd-datepicker-focused" : "",
        );
    }

    private getOverlayWrapperClasses() {
        const [inputAnchorPoint, pickerAnchorPoint] = this.state.align.split(" ");

        return classNames(
            "gd-datepicker-picker",
            "gd-datepicker-OverlayWrapper",
            `gd-datepicker-OverlayWrapper-${inputAnchorPoint}-xx`,
            `gd-datepicker-OverlayWrapper-xx-${pickerAnchorPoint}`,
        );
    }

    resizeHandler = debounce(() => this.alignDatePicker(), 100);

    private updateDate(date: Date) {
        return this.normalizeDate(date);
    }

    private handleInputBlur(e: FocusEvent<HTMLInputElement>) {
        this.props.onBlur(e.target.value);
    }

    private handleInputChanged(e: ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;

        const parsedDate = parseDate(value, this.props.dateFormat);

        this.props.onValidateInput?.(value);

        this.setState({ inputValue: value });

        if (parsedDate) {
            this.setState(
                {
                    selectedDate: parsedDate,
                    monthDate: parsedDate,
                },
                () => {
                    this.props.onChange(this.state.selectedDate);
                },
            );
        } else {
            if (this.props.resetOnInvalidValue) {
                this.setState({
                    selectedDate: this.state.selectedDate,
                    monthDate: this.state.selectedDate,
                });
                return;
            }

            this.setState(
                {
                    selectedDate: undefined,
                    monthDate: undefined,
                },
                () => {
                    this.props.onChange(null);
                },
            );
        }
    }

    private handleDayChanged(newlySelectedDate: Date) {
        if (!newlySelectedDate) {
            this.setState({ isOpen: false });
            return;
        }

        if (isSameDay(this.state.selectedDate, newlySelectedDate)) {
            this.setState({ isOpen: false });
            return;
        }

        this.inputRef.current.focus();

        this.props.onValidateInput?.(formatDate(newlySelectedDate, this.props.dateFormat));

        this.setState(
            {
                selectedDate: newlySelectedDate,
                monthDate: newlySelectedDate,
                inputValue: formatDate(newlySelectedDate, this.props.dateFormat),
                isOpen: false,
            },
            () => {
                this.props.onChange(newlySelectedDate);
            },
        );
    }

    private handleMonthChanged(month: Date) {
        this.inputRef.current.focus();
        this.setState({ monthDate: month });
    }

    private handleCustomDayClick: DayEventHandler<ReactMouseEvent> = (day, _modifiers) => {
        // Handle all day clicks, including outside days
        this.handleDayChanged(day);
    };

    private normalizeDate(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private alignDatePicker() {
        const { alignPoints } = this.props;
        const container = this.datePickerContainerRef.current?.parentElement;

        if (!alignPoints || !container) {
            return;
        }

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

    private onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape" || e.key === "Tab") {
            this.setState({ isOpen: false });
        }

        if (isEnterKey(e)) {
            this.props.onDateInputKeyDown?.(e);
        }
    }
    private handleWrapperClick(e: ReactMouseEvent<HTMLDivElement>) {
        const { classList } = e.target as HTMLInputElement;

        /**
         * Prevent default fixes bug BB-332 but prevents in closing other dropdowns (Bug BB-1102)
         * so we want to prevent default only when clicking on outside dates in datepicker
         */
        if (e.target && classList?.contains(DATEPICKER_OUTSIDE_DAY_SELECTOR)) {
            e.preventDefault();
        }
    }

    public override render(): ReactNode {
        const { inputValue, selectedDate, monthDate, isOpen } = this.state;
        const { accessibilityConfig, placeholder, intl, tabIndex } = this.props;

        const classNamesProps: ClassNames = {
            root: this.getOverlayWrapperClasses(),
        } as ClassNames;

        return (
            <div
                data-testid="datepicker"
                className={this.getComponentClasses()}
                ref={this.setComponentRef}
                onClick={this.handleWrapperClick}
            >
                <input
                    role="combobox"
                    autoComplete="off"
                    aria-haspopup="dialog"
                    aria-expanded={isOpen ? "true" : "false"}
                    aria-controls={isOpen ? `datepicker-popup-${this.datePickerId}` : undefined}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                    aria-label={
                        accessibilityConfig?.ariaLabel ||
                        intl.formatMessage({ id: "datePicker.accessibility.label" })
                    }
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                    onKeyDown={this.onKeyDown}
                    tabIndex={tabIndex}
                    onClick={() => this.setState({ isOpen: true })}
                    ref={this.inputRef}
                    value={inputValue}
                    className={this.getInputClasses()}
                    placeholder={placeholder}
                    onChange={this.handleInputChanged}
                    onBlur={this.handleInputBlur}
                />

                {isOpen ? (
                    <div
                        id={`datepicker-popup-${this.datePickerId}`}
                        role="dialog"
                        ref={this.datePickerContainerRef}
                    >
                        <DayPicker
                            classNames={classNamesProps}
                            locale={convertLocale(intl.locale)}
                            showOutsideDays={true}
                            mode="single"
                            selected={selectedDate}
                            month={monthDate}
                            onMonthChange={this.handleMonthChanged}
                            weekStartsOn={convertWeekStart(this.props.weekStart)}
                            onDayClick={this.handleCustomDayClick}
                        />
                    </div>
                ) : null}
                <span className="gd-datepicker-icon gd-icon-calendar" />
            </div>
        );
    }
}

const DatePickerWithIntl = injectIntl(WrappedDatePicker);

/**
 * @internal
 */
export class Datepicker extends PureComponent<IDatePickerOwnProps> {
    public override render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <DatePickerWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
