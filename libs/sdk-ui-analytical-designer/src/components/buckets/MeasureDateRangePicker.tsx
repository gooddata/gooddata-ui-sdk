// (C) 2007-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { getWeekStart } from "../../selectors/feature_flag_selector.js";
import { DateRangePicker } from "../DateRangePicker.js";

export interface IMeasureDateRangePickerProps {
    className?: string;
    dateFormat: string;
    start: Date;
    end: Date;
    onApply: (start: Date, end: Date) => void;
    onCancel: () => void;
}

export function MeasureDateRangePicker({
    className = "",
    dateFormat,
    start: initialStart = null,
    end: initialEnd = null,
    onApply,
    onCancel,
}: IMeasureDateRangePickerProps) {
    const intl = useIntl();
    const weekStart = useSelector(getWeekStart);

    const isValidDate = useCallback((date: Date) => {
        return date !== null;
    }, []);

    const [start, setStart] = useState(initialStart);
    const [end, setEnd] = useState(initialEnd);
    const [isValidStart, setIsValidStart] = useState(isValidDate(initialStart));
    const [isValidEnd, setIsValidEnd] = useState(isValidDate(initialEnd));

    const onStartDateChanged = useCallback(
        (start: Date) => {
            if (isValidDate(start)) {
                const validEnd = Math.max(start ? start.getTime() : 0, end ? end.getTime() : 0);

                setIsValidStart(true);
                setStart(start);
                setEnd(new Date(validEnd));
            } else {
                setIsValidStart(false);
            }
        },
        [end, isValidDate],
    );

    const onEndDateChanged = useCallback(
        (end: Date) => {
            if (isValidDate(end)) {
                const validStart = Math.min(end ? end.getTime() : 0, start ? start.getTime() : 0);

                setIsValidEnd(true);
                setStart(new Date(validStart));
                setEnd(end);
            } else {
                setIsValidEnd(false);
            }
        },
        [start, isValidDate],
    );

    const onApplyDateRange = useCallback(() => {
        onApply(start, end);
    }, [onApply, start, end]);

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const isApplyButtonDisabled = useCallback(() => {
        return !(isValidStart && isValidEnd);
    }, [isValidStart, isValidEnd]);

    const cancelText = intl.formatMessage({ id: "cancel" });
    const applyText = intl.formatMessage({ id: "apply" });

    return (
        <section className={className}>
            <DateRangePicker
                dateFormat={dateFormat}
                start={start}
                end={end}
                onStartDateChanged={onStartDateChanged}
                onEndDateChanged={onEndDateChanged}
                weekStart={weekStart}
            />
            <footer>
                <Button
                    tabIndex={4}
                    className="gd-button-secondary gd-button-small s-date-range-cancel"
                    onClick={handleCancel}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    tabIndex={3}
                    className="gd-button-action gd-button-small s-date-range-apply"
                    onClick={onApplyDateRange}
                    value={applyText}
                    title={applyText}
                    disabled={isApplyButtonDisabled()}
                />
            </footer>
        </section>
    );
}
