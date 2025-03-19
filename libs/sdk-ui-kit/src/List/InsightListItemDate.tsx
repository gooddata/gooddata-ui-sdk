// (C) 2007-2024 GoodData Corporation
import React from "react";
import { FormattedMessage, FormattedTime, FormattedDate } from "react-intl";
import { IDateConfig } from "../utils/dateTimeConfig.js";

/**
 * Keep the type for backward compatibility
 * @internal
 * @deprecated use IDateConfig from sdk-ui-kit instead
 */
export type IInsightListItemDateConfig = IDateConfig;

/**
 * @internal
 */
export interface IInsightListItemDateProps {
    config: IDateConfig;
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
