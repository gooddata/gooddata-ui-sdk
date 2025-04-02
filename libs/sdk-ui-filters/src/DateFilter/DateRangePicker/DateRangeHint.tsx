// (C) 2025 GoodData Corporation

import React from "react";
import { IntlShape } from "react-intl";

import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

import { DATE_INPUT_HINT_ID, TIME_INPUT_HINT_ID } from "./types.js";

export const DateRangeHint: React.FC<{
    dateFormat: string;
    isTimeEnabled: boolean;
    intl: IntlShape;
}> = ({ dateFormat, isTimeEnabled, intl }) => (
    <div className="gd-date-range__hint">
        <div id={DATE_INPUT_HINT_ID}>
            {intl.formatMessage(
                { id: "filters.staticPeriod.dateFormatHint" },
                { format: dateFormat || getLocalizedDateFormat(intl.locale) },
            )}
        </div>
        {isTimeEnabled ? (
            <div id={TIME_INPUT_HINT_ID}>
                {intl.formatMessage({ id: "filters.staticPeriod.timeFormatHint" })}
            </div>
        ) : null}
    </div>
);
