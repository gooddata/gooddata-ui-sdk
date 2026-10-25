// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { isAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { normalizeSelectedFilterOption } from "@gooddata/sdk-ui-filters/internal";

import { ALL_TIME } from "../../constants/presets.js";
import { type IDecoratedDateFilter } from "../../models/date_filter.js";
import { type IPresetItem } from "../../models/preset_item.js";
import { type IDateFilterConfig } from "../../store/filter_bar/filter_bar_types.js";
import {
    type IDateFilterOption,
    buildDateFilterValueFromDateFilterOption,
    matchDateFilterValueToDateFilterOption,
} from "../filterBar/dateFilter/dateFilterOptionFactory.js";

// Stored absolute metric filters carry `type: "absolute"` without a name, so the type is kept as stored
// rather than derived from the name like `asDateFilterConfig` does. Relative bounds may be stored as
// numeric strings, which the preset matching compares strictly, so they are coerced to numbers.
const toDateFilterConfig = ({
    name,
    type,
    granularity,
    interval,
    boundedFilter,
}: IPresetItem): IDateFilterConfig => {
    const isAbsolute = type === "absolute";
    return {
        name,
        granularity,
        interval: isAbsolute ? interval : [Number(interval[0]), Number(interval[1])],
        type: isAbsolute ? "absolute" : "relative",
        ...(boundedFilter ? { boundedFilter } : {}),
    };
};

/**
 * Converts the stored metric date filter into the option the shared date filter components work with.
 * Returns undefined when the metric has no date filter yet.
 */
export function measureDateFilterToOption(
    filter: IDecoratedDateFilter | undefined,
): IDateFilterOption | undefined {
    const stored = filter?.interval?.original;
    if (!stored || isEmpty(stored)) {
        return undefined;
    }
    // the legacy All time filter is stored as the bare preset name, without an interval
    if (stored.name === ALL_TIME) {
        return matchDateFilterValueToDateFilterOption({
            name: ALL_TIME,
            granularity: undefined,
            interval: undefined,
        });
    }
    if (!stored.interval) {
        return undefined;
    }
    return matchDateFilterValueToDateFilterOption(toDateFilterConfig(stored));
}

/**
 * Converts the option picked in the shared date filter components into the interval stored on the metric filter.
 * All time lands in the legacy shape, the bare preset name: it is stored in the visualization object like
 * the filter bar's All time and, like it, dropped from the execution.
 */
export function optionToMeasureDateFilterInterval({
    filterOption,
    excludeCurrentPeriod,
}: IDateFilterOption): IPresetItem | undefined {
    if (isAllTimeDateFilterOption(filterOption)) {
        return { name: ALL_TIME };
    }
    const normalized = normalizeSelectedFilterOption(filterOption);
    return buildDateFilterValueFromDateFilterOption(
        DateFilterHelpers.applyExcludeCurrentPeriod(normalized, excludeCurrentPeriod),
    );
}
