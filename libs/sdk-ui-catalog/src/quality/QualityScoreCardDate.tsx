// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { UiDate } from "@gooddata/sdk-ui-kit";

// Display only the year, month, and day to prevent overly long date strings
const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
};

type Props = {
    date: string;
    locale?: string;
};

export function QualityScoreCardDate({ date, locale }: Props) {
    return (
        <div className="gd-analytics-catalog__quality-score-card__date">
            <FormattedMessage
                id="analyticsCatalog.quality.scoreCard.lastCheck"
                values={{ date: <UiDate date={date} locale={locale} absoluteOptions={formatOptions} /> }}
            />
        </div>
    );
}
