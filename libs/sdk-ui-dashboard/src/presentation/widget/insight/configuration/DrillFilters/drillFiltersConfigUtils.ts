// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardAttributeFilterSelectionType,
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogMeasure,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IMeasure,
    type ObjRef,
    type ObjRefInScope,
    type SourceInsightFilterObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    isDashboardDateFilterWithDimension,
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
import { canApplyFilterTypeToTarget } from "../../../../../model/commandHandlers/dashboard/common/attributeFilterSelectionTypeCompatibility.js";
import {
    findDashboardAttributeFilterByAttributeDisplayForms,
    findDashboardAttributeFilterByDisplayForm,
    findDashboardAttributeFilterByIncomingDisplayAsLabel,
    findDashboardAttributeFilterByTargetDisplayAsLabel,
} from "../../../../../model/utils/filterContextUtils.js";

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

export function hasMatchingTargetDashboardAttributeFilterDisplayForm(
    displayFormRef: ObjRef,
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
): boolean {
    return !!findDashboardAttributeFilterByDisplayForm(targetDashboardAttributeFilters, displayFormRef);
}

export function hasMatchingTargetDashboardAttributeFilter(
    dashboardFilter: IDashboardAttributeFilter,
    sourceDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): boolean {
    const displayFormRef = dashboardFilter.attributeFilter.displayForm;

    if (
        hasMatchingTargetDashboardAttributeFilterDisplayForm(displayFormRef, targetDashboardAttributeFilters)
    ) {
        return true;
    }

    const sourceDisplayForm = allCatalogDisplayFormsMap.get(displayFormRef);
    if (sourceDisplayForm) {
        const attributeDisplayForms = Array.from(allCatalogDisplayFormsMap.values()).filter((displayForm) =>
            areObjRefsEqual(displayForm.attribute, sourceDisplayForm.attribute),
        );

        if (
            findDashboardAttributeFilterByAttributeDisplayForms(
                targetDashboardAttributeFilters,
                attributeDisplayForms,
            )
        ) {
            return true;
        }
    }

    if (
        findDashboardAttributeFilterByIncomingDisplayAsLabel(
            dashboardFilter,
            sourceDashboardAttributeFilterConfigs,
            targetDashboardAttributeFilters,
        )
    ) {
        return true;
    }

    return !!findDashboardAttributeFilterByTargetDisplayAsLabel(
        displayFormRef,
        targetDashboardAttributeFilters,
        targetDashboardAttributeFilterConfigs,
    );
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

export function isDateIntersectionAttribute(
    displayFormRef: ObjRef,
    allCatalogDateAttributeDisplayForms: Array<{ ref: ObjRef; title?: string }>,
): boolean {
    return allCatalogDateAttributeDisplayForms.some((displayForm) =>
        areObjRefsEqual(displayForm.ref, displayFormRef),
    );
}

function getConfigSelectionType(
    targetFilterLocalId: string,
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
): DashboardAttributeFilterSelectionType | undefined {
    return targetDashboardAttributeFilterConfigs.find((c) => c.localIdentifier === targetFilterLocalId)
        ?.selectionType;
}

/**
 * Finds a matching text filter on the target dashboard by displayForm.
 * Checks the source filter's displayForm and optionally its displayAsLabel from config.
 */
function findMatchingTargetTextFilter(
    displayFormRef: ObjRef,
    sourceDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
    sourceFilterLocalId: string | undefined,
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[],
): DashboardTextAttributeFilter | undefined {
    // Direct displayForm match
    const directMatch = targetDashboardTextAttributeFilters.find((textFilter) =>
        areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(textFilter), displayFormRef),
    );
    if (directMatch) {
        return directMatch;
    }

    // Check source's displayAsLabel from config
    if (sourceFilterLocalId) {
        const sourceConfig = sourceDashboardAttributeFilterConfigs.find(
            (c) => c.localIdentifier === sourceFilterLocalId,
        );
        if (sourceConfig?.displayAsLabel) {
            return targetDashboardTextAttributeFilters.find((textFilter) =>
                areObjRefsEqual(
                    dashboardAttributeFilterItemDisplayForm(textFilter),
                    sourceConfig.displayAsLabel!,
                ),
            );
        }
    }

    return undefined;
}

/**
 * Finds a matching list filter on the target dashboard for a text source filter.
 * Text filter has only displayForm. List filter has primary displayForm + displayAsLabel in config.
 * Match if text filter's displayForm equals either of those.
 */
function findMatchingTargetListFilterForTextSource(
    textFilterDisplayFormRef: ObjRef,
    targetDashboardAttributeFilters: IDashboardAttributeFilter[],
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
): IDashboardAttributeFilter | undefined {
    // Direct displayForm match
    const directMatch = findDashboardAttributeFilterByDisplayForm(
        targetDashboardAttributeFilters,
        textFilterDisplayFormRef,
    );
    if (directMatch) {
        return directMatch;
    }

    // Check target's displayAsLabel — find a config whose displayAsLabel matches the text filter's displayForm
    return findDashboardAttributeFilterByTargetDisplayAsLabel(
        textFilterDisplayFormRef,
        targetDashboardAttributeFilters,
        targetDashboardAttributeFilterConfigs,
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
    // 1. Same-type match against list filters — always OK
    if (
        hasMatchingTargetDashboardAttributeFilter(
            sourceFilter,
            sourceDashboardAttributeFilterConfigs,
            targetDashboardAttributeFilters,
            targetDashboardAttributeFilterConfigs,
            allCatalogDisplayFormsMap,
        )
    ) {
        return "transferable";
    }

    // 2. Cross-type match against text filters on target
    const matchingTextFilter = findMatchingTargetTextFilter(
        sourceFilter.attributeFilter.displayForm,
        sourceDashboardAttributeFilterConfigs,
        sourceFilter.attributeFilter.localIdentifier,
        targetDashboardTextAttributeFilters,
    );

    if (!matchingTextFilter) {
        return "notFound";
    }

    // 3. Check if the target text filter's selection type allows list type
    const textFilterLocalId = dashboardAttributeFilterItemLocalIdentifier(matchingTextFilter);
    if (!textFilterLocalId) {
        return "notFound";
    }

    const configSelectionType = getConfigSelectionType(
        textFilterLocalId,
        targetDashboardAttributeFilterConfigs,
    );
    return canApplyFilterTypeToTarget("list", configSelectionType, matchingTextFilter)
        ? "transferable"
        : "notCompatible";
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
): FilterTransferResult {
    const sourceDisplayFormRef = dashboardAttributeFilterItemDisplayForm(sourceFilter);

    // 1. Same-type match against text filters — always OK
    const matchingTextFilter = targetDashboardTextAttributeFilters.find((textFilter) =>
        areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(textFilter), sourceDisplayFormRef),
    );
    if (matchingTextFilter) {
        return "transferable";
    }

    // 2. Cross-type match against list filters on target
    // Text filter has only displayForm; list filter has primary displayForm + displayAsLabel in config
    const matchingListFilter = findMatchingTargetListFilterForTextSource(
        sourceDisplayFormRef,
        targetDashboardAttributeFilters,
        targetDashboardAttributeFilterConfigs,
    );

    if (!matchingListFilter) {
        return "notFound";
    }

    // 3. Check if the target list filter's selection type allows text type
    const listFilterLocalId = matchingListFilter.attributeFilter.localIdentifier;
    if (!listFilterLocalId) {
        return "notFound";
    }

    const configSelectionType = getConfigSelectionType(
        listFilterLocalId,
        targetDashboardAttributeFilterConfigs,
    );
    return canApplyFilterTypeToTarget("text", configSelectionType, matchingListFilter)
        ? "transferable"
        : "notCompatible";
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
): FilterTransferResult {
    if (isSourceTextFilter) {
        // Text source: check text targets first, then list targets with selection type
        const matchingTextFilter = targetDashboardTextAttributeFilters.find((textFilter) =>
            areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(textFilter), displayFormRef),
        );
        if (matchingTextFilter) {
            return "transferable";
        }

        const matchingListFilter = findMatchingTargetListFilterForTextSource(
            displayFormRef,
            targetDashboardAttributeFilters,
            targetDashboardAttributeFilterConfigs,
        );
        if (!matchingListFilter) {
            return "notFound";
        }

        const listFilterLocalId = matchingListFilter.attributeFilter.localIdentifier;
        if (!listFilterLocalId) {
            return "notFound";
        }

        const configSelectionType = getConfigSelectionType(
            listFilterLocalId,
            targetDashboardAttributeFilterConfigs,
        );
        return canApplyFilterTypeToTarget("text", configSelectionType, matchingListFilter)
            ? "transferable"
            : "notCompatible";
    }

    // List source: check list targets first, then text targets with selection type
    if (
        hasMatchingTargetDashboardAttributeFilterDisplayForm(displayFormRef, targetDashboardAttributeFilters)
    ) {
        return "transferable";
    }

    const matchingTextFilter = targetDashboardTextAttributeFilters.find((textFilter) =>
        areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(textFilter), displayFormRef),
    );
    if (!matchingTextFilter) {
        return "notFound";
    }

    const textFilterLocalId = dashboardAttributeFilterItemLocalIdentifier(matchingTextFilter);
    if (!textFilterLocalId) {
        return "notFound";
    }

    const configSelectionType = getConfigSelectionType(
        textFilterLocalId,
        targetDashboardAttributeFilterConfigs,
    );
    return canApplyFilterTypeToTarget("list", configSelectionType, matchingTextFilter)
        ? "transferable"
        : "notCompatible";
}
