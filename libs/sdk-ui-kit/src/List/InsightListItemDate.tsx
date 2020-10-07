// (C) 2007-2020 GoodData Corporation
import React from "react";
import { FormattedMessage, FormattedTime, FormattedDate } from "react-intl";

/**
 * @internal
 */
export interface IInsightListItemDateProps {
    config: {
        isCurrentYear: boolean;
        isToday: boolean;
        isYesterday: boolean;
        date: Date;
    };
}

/**
 * @internal
 */
export const InsightListItemDate: React.FC<IInsightListItemDateProps> = ({ config }) => {
    const relativeDate = config.isToday ? "gs.date.today" : "gs.date.yesterday";

    if (config.isToday || config.isYesterday) {
        return (
            <span>
                <FormattedMessage id={relativeDate} />
                &nbsp;
                <FormattedMessage id="gs.date.at" />
                &nbsp;
                <FormattedTime value={config.date} format="hhmm" />
            </span>
        );
    } else if (config.isCurrentYear) {
        return <FormattedDate value={config.date} format="shortWithoutYear" />;
    }

    return <FormattedDate value={config.date} format="shortWithYear" />;
};
