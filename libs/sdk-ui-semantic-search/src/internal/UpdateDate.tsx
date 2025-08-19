// (C) 2024-2025 GoodData Corporation

import * as React from "react";

import { FormattedDate, FormattedMessage, FormattedTime, defineMessages } from "react-intl";

import { getDateTimeConfig } from "@gooddata/sdk-ui-kit";

import { useMetadataTimezone } from "./metadataTimezoneContext.js";

// In Tiger, it's always UTC
const DEFAULT_MD_TIMEZONE = "UTC";

/**
 * Props for the update date component.
 * @internal
 */
export type UpdateDateProps = {
    createdAt?: string;
    modifiedAt?: string;
};

const messages = defineMessages({
    today: { id: "gs.date.today" },
    yesterday: { id: "gs.date.yesterday" },
    at: { id: "semantic-search.date.at" },
});

/**
 * Rendering the update date as memoized component.
 * The list rendering was lagging and React Performance tools showed that
 * the date formatting was one of the bottlenecks.
 * @internal
 */
export const UpdatedDate = React.memo(function UpdatedDate({ createdAt, modifiedAt }: UpdateDateProps) {
    const timezone = useMetadataTimezone() ?? DEFAULT_MD_TIMEZONE;
    const timestamp = modifiedAt ?? createdAt;

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
        return (
            <span>
                <FormattedDate value={config.date} day="numeric" month="short" />
            </span>
        );
    }
    return (
        <span>
            <FormattedDate value={config.date} day="numeric" month="short" year="numeric" />
        </span>
    );
});
