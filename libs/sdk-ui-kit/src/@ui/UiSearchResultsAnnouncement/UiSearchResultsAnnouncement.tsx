// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { useIntl } from "react-intl";

import { useDebouncedState } from "@gooddata/sdk-ui";

import { messages } from "./locales.js";

// Stable empty array to avoid re-creating on every render
const EMPTY_RESULT_VALUES: string[] = [];

/**
 * Props for the SearchResultsAnnouncement component
 * @internal
 */
export interface ISearchResultsAnnouncementProps {
    /**
     * Total number of search results. Provide undefined to reset the announcement when not searching.
     */
    totalResults: number | undefined;

    /**
     * Array of result values to announce (only used when totalResults is 3 or less)
     */
    resultValues?: string[];

    /**
     * Announcement delay in milliseconds.
     */
    announcementDelay?: number;
}

/**
 * A threshold for the number of results to announce in a detailed way.
 * @internal
 */
export const DETAILED_ANNOUNCEMENT_THRESHOLD = 3;

const DEBOUNCE_DELAY = 1000;

/**
 * A hidden component that announces search results to screen readers.
 * Announcements are made only when the search results change.
 *
 * @internal
 */
export function UiSearchResultsAnnouncement({
    totalResults,
    resultValues = EMPTY_RESULT_VALUES,
    announcementDelay = DEBOUNCE_DELAY,
}: ISearchResultsAnnouncementProps) {
    const intl = useIntl();

    const [_, setMessage, message] = useDebouncedState<string | null>(null, announcementDelay); // postpone message change to let SR read letters typed in input

    useEffect(() => {
        if (totalResults === undefined) {
            setMessage(null);
            return;
        }

        if (totalResults === 0) {
            setMessage(intl.formatMessage(messages["searchResultsNone"]));
            return;
        }

        if (totalResults <= DETAILED_ANNOUNCEMENT_THRESHOLD && resultValues.length > 0) {
            setMessage(
                intl.formatMessage(messages["searchResultsFew"], {
                    count: totalResults,
                    values: resultValues.join(", "),
                }),
            );
            return;
        }

        setMessage(intl.formatMessage(messages["searchResultsMany"], { count: totalResults }));
    }, [totalResults, resultValues, intl, setMessage]);

    return (
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {message}
        </div>
    );
}
