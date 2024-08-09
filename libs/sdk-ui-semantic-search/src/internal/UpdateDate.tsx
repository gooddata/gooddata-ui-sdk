// (C) 2024 GoodData Corporation

import { ListItem } from "../types.js";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import * as React from "react";
import { getDateTimeConfig } from "@gooddata/sdk-ui-kit";
import { defineMessages, FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { useTimezone } from "./timezoneContext.js";

/**
 * Props for the update date component.
 * @internal
 */
export type UpdateDateProps = {
    listItem: ListItem<ISemanticSearchResultItem>;
};

const messages = defineMessages({
    today: { id: "gs.date.today" },
    yesterday: { id: "gs.date.yesterday" },
    at: { id: "gs.date.at" },
});

/**
 * Rendering the update date as memoized component.
 * The list rendering was lagging and React Performance tools showed that
 * the date formatting was one of the bottlenecks.
 * @internal
 */
export const UpdatedDate = React.memo(function UpdatedDate({ listItem: { item } }: UpdateDateProps) {
    const timezone = useTimezone();
    const timestamp = item.modifiedAt ?? item.createdAt;

    if (!timestamp) return null;

    const config = getDateTimeConfig(timestamp, { dateTimezone: timezone });

    const relativeDate = config.isToday ? messages.today.id : messages.yesterday.id;

    if (config.isToday || config.isYesterday) {
        return (
            <span>
                <FormattedMessage id={relativeDate} />
                &nbsp;
                <FormattedMessage id={messages.at.id} />
                &nbsp;
                <FormattedTime value={config.date} hour="numeric" minute="2-digit" />
            </span>
        );
    } else if (config.isCurrentYear) {
        return <FormattedDate value={config.date} day="numeric" month="short" />;
    }

    return <FormattedDate value={config.date} day="numeric" month="short" year="numeric" />;
});
