// (C) 2007-2026 GoodData Corporation

import { type WeekStart } from "@gooddata/sdk-model";
import { Datepicker } from "@gooddata/sdk-ui-kit";

interface IDateRangePickerProps {
    className?: string;
    dateFormat: string;
    start?: Date;
    end?: Date;
    onStartDateChanged?: (start: Date) => void;
    onEndDateChanged?: (end: Date) => void;
    weekStart?: WeekStart;
}

export function DateRangePicker({
    className = "",
    dateFormat,
    start = null,
    end = null,
    onStartDateChanged = () => {},
    onEndDateChanged = () => {},
    weekStart,
}: IDateRangePickerProps) {
    return (
        <div className={className}>
            <Datepicker
                size="small"
                className="adi-date-input-from s-interval-from"
                date={start}
                dateFormat={dateFormat}
                onChange={onStartDateChanged}
                weekStart={weekStart}
            />
            <Datepicker
                size="small"
                className="adi-date-input-to s-interval-to"
                date={end}
                dateFormat={dateFormat}
                onChange={onEndDateChanged}
                weekStart={weekStart}
            />
        </div>
    );
}
