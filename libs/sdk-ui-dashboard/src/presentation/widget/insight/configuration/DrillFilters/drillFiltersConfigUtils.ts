// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardAttributeFilterItem,
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogMeasure,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardMeasureValueFilter,
    type IMeasure,
    type ObjRef,
    type ObjRefInScope,
    type SourceInsightFilterObjRef,
    areObjRefsEqual,
    isDashboardDateFilterWithDimension,
    isDashboardMeasureValueFilter,
    isLocalIdRef,
    measureAlias,
    measureFilters,
    measureLocalId,
    measureTitle,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";
import { buildMeasureTitles } from "@gooddata/sdk-ui/internal";

import { sourceInsightFilterObjRefValue } from "../../../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";
import {
    type AttributeFilterCounterpartResult,
    findAttributeFilterCounterpart,
} from "../../../../../model/utils/attributeFilterMatching.js";
import { findDashboardAttributeFilterByDisplayForm } from "../../../../../model/utils/filterContextUtils.js";

import { messages } from "./messages.js";
import { type IDrillFiltersConfigOption } from "./types.js";

/**
 * Strip filter description suffix baked in by AD
 */
function stripMeasureFilterSuffix(measure: IMeasure, title: string): string {
    const filters = measureFilters(measure);
    if (!filters?.length) {
        return title;
    }

    return title.replace(/ \([^)]+\)$/, "");
}

export function getMeasureTitleFromSourceInsightMeasures(
    sourceInsightMeasures: IMeasure[],
    measureRef: ObjRefInScope | undefined,
    allCatalogMeasures: ICatalogMeasure[],
    intl: IntlShape,
): string | undefined {
    if (!measureRef) {
        return undefined;
    }

    if (isLocalIdRef(measureRef)) {
        const sourceMeasure = sourceInsightMeasures.find(
            (measure) => measureLocalId(measure) === measureRef.localIdentifier,
        );
        if (!sourceMeasure) {
            return undefined;
        }

        const alias = measureAlias(sourceMeasure);
        if (alias) {
            return alias;
        }

        const title = measureTitle(sourceMeasure);
        if (title) {
            return stripMeasureFilterSuffix(sourceMeasure, title);
        }

        // For arithmetic and derived measures that don't have explicit titles,
        // build the title using buildMeasureTitles from sdk-ui.
        const locale = intl.locale as ILocale;
        const messages = intl.messages as Record<string, string>;
        const allTitleProps = buildMeasureTitles(
            sourceInsightMeasures,
            locale,
            Number.MAX_SAFE_INTEGER,
            messages,
        );

        const titleProp = allTitleProps.find((p) => p.localIdentifier === measureRef.localIdentifier);
        const builtTitle = titleProp?.alias ?? titleProp?.title;
        return builtTitle ? stripMeasureFilterSuffix(sourceMeasure, builtTitle) : builtTitle;
    }

    //fallback to catalog lookup in case of object ref
    return allCatalogMeasures.find((measure) => areObjRefsEqual(measure.measure.ref, measureRef))?.measure
        .title;
}

export function sourceFilterOptionId(sourceFilterObjRef: SourceInsightFilterObjRef): string {
    return `${sourceFilterObjRef.type}:${serializeObjRef(sourceInsightFilterObjRefValue(sourceFilterObjRef))}`;
}

export function getDisabledOptionProps(
    disabled: boolean,
    message: string,
    selected: boolean,
): Partial<Pick<IDrillFiltersConfigOption, "disabled">> {
    return disabled
        ? {
              disabled: {
                  message,
                  selected,
              },
          }
        : {};
}

export function getDisabledOptionPropsForTransferResult(
    isDrillToDashboard: boolean,
    transferResult: FilterTransferResult,
    intl: IntlShape,
): Partial<Pick<IDrillFiltersConfigOption, "disabled">> {
    if (!isDrillToDashboard || transferResult === "transferable") {
        return {};
    }

    const message =
        transferResult === "notCompatible"
            ? intl.formatMessage(messages.drillToDashboardFilterNotCompatibleTooltip)
            : intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip);

    return getDisabledOptionProps(true, message, false);
}

export function getDisplayFormTitle({
    displayFormRef,
    allCatalogDisplayFormsMap,
}: {
    displayFormRef: ObjRefInScope;
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
}): string {
    if (isLocalIdRef(displayFormRef)) {
        return "";
    }

    return allCatalogDisplayFormsMap.get(displayFormRef)?.title ?? "";
}

export function getDateDatasetTitle({
    datasetRef,
    allCatalogDateDatasets,
}: {
    datasetRef: ObjRefInScope;
    allCatalogDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
}): string {
    const dateDataset = allCatalogDateDatasets.find((dataset) =>
        areObjRefsEqual(dataset.dataSet.ref, datasetRef),
    );

    return dateDataset?.dataSet.title ?? "";
}

export function getDashboardDateFilterCustomTitle({
    datasetRef,
    allDateFilterConfigsOverrides,
}: {
    datasetRef: ObjRefInScope;
    allDateFilterConfigsOverrides: IDashboardDateFilterConfigItem[];
}): string | undefined {
    const customTitle = allDateFilterConfigsOverrides.find((configOverride) =>
        areObjRefsEqual(configOverride.dateDataSet, datasetRef),
    )?.config.filterName;

    return customTitle || undefined;
}

export function getCatalogMeasureTitle(measureRef: ObjRef, allCatalogMeasures: ICatalogMeasure[]): string {
    return (
        allCatalogMeasures.find((measure) => areObjRefsEqual(measure.measure.ref, measureRef))?.measure
            .title ?? ""
    );
}

export function hasMatchingTargetDashboardAttributeFilterDisplayForm(
    displayFormRef: ObjRef,
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
): boolean {
    return !!findDashboardAttributeFilterByDisplayForm(targetDashboardAttributeFilters, displayFormRef);
}

export function hasMatchingTargetDashboardDateFilter(
    datasetRef: ObjRef,
    targetDashboardFilters: FilterContextItem[],
): boolean {
    return targetDashboardFilters.some(
        (targetDashboardFilter) =>
            isDashboardDateFilterWithDimension(targetDashboardFilter) &&
            areObjRefsEqual(datasetRef, targetDashboardFilter.dateFilter.dataSet),
    );
}

export function hasMatchingTargetDashboardMeasureValueFilter(
    measureRef: ObjRefInScope | undefined,
    targetDashboardFilters: FilterContextItem[],
): boolean {
    if (!measureRef) {
        return false;
    }

    return targetDashboardFilters.some(
        (targetDashboardFilter) =>
            isDashboardMeasureValueFilter(targetDashboardFilter) &&
            areObjRefsEqual(measureRef, targetDashboardFilter.dashboardMeasureValueFilter.measure),
    );
}

export function hasCompatibleTargetInsightMeasureValueFilter(
    measureRef: ObjRef,
    targetInsightCompatibleMeasureValueFilters: IDashboardMeasureValueFilter[],
): boolean {
    return targetInsightCompatibleMeasureValueFilters.some((targetMeasureValueFilter) =>
        areObjRefsEqual(measureRef, targetMeasureValueFilter.dashboardMeasureValueFilter.measure),
    );
}

export function isDateIntersectionAttribute(
    displayFormRef: ObjRef,
    allCatalogDateAttributeDisplayForms: Array<{ ref: ObjRef; title?: string }>,
): boolean {
    return allCatalogDateAttributeDisplayForms.some((displayForm) =>
        areObjRefsEqual(displayForm.ref, displayFormRef),
    );
}

/**
 * Reason why a filter cannot be transferred to the target dashboard.
 * - "transferable" — filter can be transferred
 * - "notFound" — no matching filter exists on the target dashboard
 * - "notCompatible" — matching filter exists but selection type config doesn't allow the type migration
 */
export type FilterTransferResult = "transferable" | "notFound" | "notCompatible";

/**
 * Checks if a list-type dashboard attribute filter can be transferred to the target dashboard,
 * considering both list and text filters on the target, and selection type config.
 */
export function canTransferDashboardAttributeFilter(
    sourceFilter: IDashboardAttributeFilter,
    sourceDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[],
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): FilterTransferResult {
    return toFilterTransferResult(
        findAttributeFilterCounterpart(
            sourceFilter,
            [...targetDashboardAttributeFilters, ...targetDashboardTextAttributeFilters],
            {
                sourceFilterConfigs: sourceDashboardAttributeFilterConfigs,
                targetFilterConfigs: targetDashboardAttributeFilterConfigs,
                displayForms: Array.from(allCatalogDisplayFormsMap.values()),
            },
        ),
    );
}

/**
 * Checks if a text-type dashboard attribute filter can be transferred to the target dashboard,
 * considering both text and list filters on the target, and selection type config.
 */
export function canTransferTextAttributeFilter(
    sourceFilter: DashboardTextAttributeFilter,
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[],
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): FilterTransferResult {
    return toFilterTransferResult(
        findAttributeFilterCounterpart(
            sourceFilter,
            [...targetDashboardTextAttributeFilters, ...targetDashboardAttributeFilters],
            {
                targetFilterConfigs: targetDashboardAttributeFilterConfigs,
                displayForms: Array.from(allCatalogDisplayFormsMap.values()),
            },
        ),
    );
}

/**
 * Checks if a source insight/measure attribute filter (by displayForm) can be transferred,
 * considering both list and text filters on the target, and selection type config.
 * Used for source insight filters and source measure filters where we only have a displayForm.
 *
 * @param displayFormRef - the displayForm of the source filter
 * @param isSourceTextFilter - whether the source filter is a text type (arbitrary/match)
 * @param targetDashboardAttributeFilters - list filters on the target dashboard
 * @param targetDashboardAttributeFilterConfigs - attribute filter configs on the target dashboard
 * @param targetDashboardTextAttributeFilters - text filters on the target dashboard
 */
export function canTransferAttributeFilterByDisplayForm(
    displayFormRef: ObjRef,
    isSourceTextFilter: boolean,
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[],
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): FilterTransferResult {
    const source = {
        displayForm: displayFormRef,
        type: isSourceTextFilter ? ("text" as const) : ("list" as const),
    };
    const targets: DashboardAttributeFilterItem[] = [
        ...targetDashboardAttributeFilters,
        ...targetDashboardTextAttributeFilters,
    ];
    return toFilterTransferResult(
        findAttributeFilterCounterpart(source, targets, {
            targetFilterConfigs: targetDashboardAttributeFilterConfigs,
            displayForms: Array.from(allCatalogDisplayFormsMap.values()),
        }),
    );
}

function toFilterTransferResult(result: AttributeFilterCounterpartResult): FilterTransferResult {
    return result.status === "matched" ? "transferable" : result.status;
}
