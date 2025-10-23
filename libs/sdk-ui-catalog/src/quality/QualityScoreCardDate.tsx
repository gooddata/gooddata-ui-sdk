// (C) 2025 GoodData Corporation

import { UiDate } from "@gooddata/sdk-ui-kit";

type Props = {
    date: string;
    locale?: string;
};

export function QualityScoreCardDate({ date, locale }: Props) {
    return (
        <div className="gd-analytics-catalog__quality-score-card__date">
            <UiDate date={date} locale={locale} />
        </div>
    );
}
