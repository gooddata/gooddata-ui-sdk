// (C) 2025-2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

const messages = defineMessages({
    dateFormatHint: { id: "filters.staticPeriod.dateFormatHint" },
    timeFormatHint: { id: "filters.staticPeriod.timeFormatHint" },
    timeFormatHintWithSeconds: { id: "filters.staticPeriod.timeFormatHintWithSeconds" },
});

export function DateRangeHint({
    dateFormat,
    isTimeEnabled,
    isSecondsEnabled = false,
    dateHintId,
    timeHintId,
    intl,
}: {
    dateFormat: string;
    isTimeEnabled: boolean;
    isSecondsEnabled?: boolean;
    dateHintId: string;
    timeHintId: string;
    intl: IntlShape;
}) {
    return (
        <div className="gd-date-range__hint">
            <div id={dateHintId}>
                {intl.formatMessage(messages.dateFormatHint, {
                    format: dateFormat || getLocalizedDateFormat(intl.locale),
                })}
            </div>
            {isTimeEnabled ? (
                <div id={timeHintId}>
                    {intl.formatMessage(
                        isSecondsEnabled ? messages.timeFormatHintWithSeconds : messages.timeFormatHint,
                    )}
                </div>
            ) : null}
        </div>
    );
}
