// (C) 2007-2026 GoodData Corporation

import { FormattedDate, FormattedMessage, FormattedTime, defineMessage } from "react-intl";

import { type IDateConfig } from "../utils/dateTimeConfig.js";

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
export function InsightListItemDate({ config }: IInsightListItemDateProps) {
    const relativeDate = config.isToday
        ? defineMessage({ id: "gs.date.today" }).id
        : defineMessage({ id: "gs.date.yesterday" }).id;

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
}
