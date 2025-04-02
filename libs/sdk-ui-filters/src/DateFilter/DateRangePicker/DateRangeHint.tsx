// (C) 2025 GoodData Corporation

import React from "react";
import { IntlShape } from "react-intl";

import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

export const DateRangeHint: React.FC<{
    dateFormat: string;
    isTimeEnabled: boolean;
    dateHintId: string;
    timeHintId: string;
    intl: IntlShape;
}> = ({ dateFormat, isTimeEnabled, dateHintId, timeHintId, intl }) => (
    <div className="gd-date-range__hint">
        <div id={dateHintId}>
            {intl.formatMessage(
                { id: "filters.staticPeriod.dateFormatHint" },
                { format: dateFormat || getLocalizedDateFormat(intl.locale) },
            )}
        </div>
        {isTimeEnabled ? (
            <div id={timeHintId}>{intl.formatMessage({ id: "filters.staticPeriod.timeFormatHint" })}</div>
        ) : null}
    </div>
);
