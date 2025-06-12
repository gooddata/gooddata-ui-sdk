// (C) 2021-2022 GoodData Corporation
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

/**
 * Type of broken alert filter basic info
 *
 * @alpha
 */
export type BrokenAlertType = "deleted" | "ignored";

/**
 * Information about the broken alert filters. These are filters that are set up on the alert,
 * but the currently applied filters either do not contain them, or the KPI has started ignoring them
 * since the alert was first set up.
 *
 * @alpha
 */
export interface IBrokenAlertFilterBasicInfo<TFilter extends FilterContextItem = FilterContextItem> {
    alertFilter: TFilter;
    brokenType: BrokenAlertType;
}

/**
 * Broken alert date filter basic info {@link @gooddata/sdk-backend-spi#IDashboardDateFilter}.
 *
 * @alpha
 */
export type BrokenAlertDateFilterInfo = IBrokenAlertFilterBasicInfo<IDashboardDateFilter>;

/**
 * Tests whether the provided object is an instance of {@link BrokenAlertDateFilterInfo}
 *
 * @param item - object to test
 *
 * @alpha
 */
export function isBrokenAlertDateFilterInfo(
    item: IBrokenAlertFilterBasicInfo,
): item is BrokenAlertDateFilterInfo {
    return isDashboardDateFilter(item.alertFilter);
}

/**
 * Broken alert attribute filter basic info {@link @gooddata/sdk-backend-spi#IDashboardAttributeFilter}.
 *
 * @alpha
 */
export type BrokenAlertAttributeFilterInfo = IBrokenAlertFilterBasicInfo<IDashboardAttributeFilter>;

/**
 * Tests whether the provided object is an instance of {@link BrokenAlertAttributeFilterInfo}
 *
 * @param item - object to test
 *
 * @alpha
 */
export function isBrokenAlertAttributeFilterInfo(
    item: IBrokenAlertFilterBasicInfo,
): item is BrokenAlertAttributeFilterInfo {
    return isDashboardAttributeFilter(item.alertFilter);
}
