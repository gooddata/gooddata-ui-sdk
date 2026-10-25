// (C) 2020-2026 GoodData Corporation

import { omit } from "lodash-es";
import moment from "moment";

import { type AdCommandData } from "@gooddata/sdk-embedding";
import {
    type DisplayFormRefType,
    type ITransformedDateFilterItem,
    filterConverters,
} from "@gooddata/sdk-embedding/internal";

import { ALL_TIME } from "../../constants/presets.js";
import { GRANULARITY, type Granularity } from "../../models/granularity.js";
import { type IDateFilterConfig } from "../../store/filter_bar/filter_bar_types.js";
import { type ICatalogEntries, type ICatalogEntry } from "../../typings/state_objects.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    type IPostMessageContextContent,
} from "../actions/post_message_action_helper.js";
import { WRITE_COMMANDS } from "../outgoing/supported_commands_events.js";

const SUPPORTED_DATE_GRANULARITY: Record<string, string> = {
    "GDC.time.second": "second",
    "GDC.time.minute": "minute",
    "GDC.time.hour": "hour",
    "GDC.time.date": "days",
    "GDC.time.week_us": "weeks",
    "GDC.time.month": "months",
    "GDC.time.fiscal_month": "fiscal_months",
    "GDC.time.quarter": "quarters",
    "GDC.time.fiscal_quarter": "fiscal_quarters",
    "GDC.time.year": "years",
    "GDC.time.fiscal_year": "fiscal_years",
    ALL_TIME_GRANULARITY: "all_time",
};

export const getSupportedGranularities = (
    isTimeSupported: boolean,
    isSecondsSupported = true,
): Record<string, string> => {
    if (isTimeSupported) {
        // Second precision is additionally gated by the enableSecondGranularities feature flag: when it is off
        // second-level filters must not be treated as supported (mirrors the date filter form and Dashboard),
        // otherwise an embedder could set a second filter that the UI then rejects and resets.
        return isSecondsSupported
            ? SUPPORTED_DATE_GRANULARITY
            : omit(SUPPORTED_DATE_GRANULARITY, ["GDC.time.second"]);
    }
    return omit(SUPPORTED_DATE_GRANULARITY, ["GDC.time.second", "GDC.time.minute", "GDC.time.hour"]);
};

export function getPostMessageContextId(postMessageContextContent?: IPostMessageContextContent): string {
    const { contextId } = postMessageContextContent || {};
    return contextId;
}

export function getPostMessageContextIdFromCommandData(commandData: AdCommandData): string {
    const { gdc: { event: { contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } = {} } = {} } = commandData || {};
    return contextId;
}

export function isWriteCommand(commandType: string): boolean {
    return (WRITE_COMMANDS as string[]).includes(commandType);
}

export function buildDateFilterConfig({
    from,
    to,
    granularity,
    boundedFilter,
}: ITransformedDateFilterItem): IDateFilterConfig {
    if (!granularity) {
        return buildAbsoluteDateFilterConfig(from as string, to as string);
    }

    if (granularity === filterConverters.ALL_TIME_GRANULARITY) {
        return { name: ALL_TIME, granularity: undefined, interval: undefined };
    }

    return {
        type: "relative",
        granularity: granularity as Granularity,
        interval: [from as number, to as number],
        ...(boundedFilter ? { boundedFilter } : {}),
    };
}

export function convertRelativeToStaticDate(
    dateFilter: ITransformedDateFilterItem,
    projectTimezoneOffset: number,
    isTimeSupported: boolean,
    currentDate?: moment.Moment,
) {
    const { from, to, granularity } = dateFilter;

    const unit = getSupportedGranularities(isTimeSupported)[
        granularity
    ] as moment.unitOfTime.DurationConstructor;
    const momentWithTimezone = moment(currentDate).utcOffset(projectTimezoneOffset / 3600000);

    const periodFrom = moment(momentWithTimezone)
        .startOf(unit)
        .add(from, unit)
        .format(filterConverters.EXTERNAL_DATE_FILTER_FORMAT);

    const periodTo = moment(momentWithTimezone)
        .endOf(unit)
        .add(to, unit)
        .format(filterConverters.EXTERNAL_DATE_FILTER_FORMAT);

    return { periodFrom, periodTo };
}

function buildAbsoluteDateFilterConfig(from: string, to: string): IDateFilterConfig {
    return {
        interval: [from, to],
        type: "absolute",
        granularity: GRANULARITY.DATE,
    };
}

export function getItemCacheByDfUriFromAvailableDisplayForms(
    dfUri: string,
    itemsCached: ICatalogEntries,
): ICatalogEntry {
    return Object.values(itemsCached).find((itemCache) =>
        itemCache.displayForms?.some((df) => df.uri === dfUri),
    );
}

/**
 * Finds the cached catalog item owning the display form with the given identifier.
 *
 * A computed attribute lives in its own item cache namespace and its single display form shares the
 * computed attribute's identifier, so a label and a computed attribute may carry the same display form
 * identifier. The lookup therefore only considers items of the namespace the reference type points at:
 * plain attributes (and date attributes) for a label, computed attributes for a computed attribute.
 */
export function getItemCacheByDfIdentifierFromAvailableDisplayForms(
    dfIdentifier: string,
    itemsCached: ICatalogEntries,
    dfType: DisplayFormRefType = "displayForm",
): ICatalogEntry {
    const isComputedAttribute = dfType === "computedAttribute";
    return Object.values(itemsCached).find(
        (itemCache) =>
            (itemCache.type === "computedAttribute") === isComputedAttribute &&
            itemCache.displayForms?.some((df) => df.id === dfIdentifier),
    );
}
