// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
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

import { type IDrillFiltersConfigOption } from "./types.js";
import { sourceInsightFilterObjRefValue } from "../../../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";
import {
    findDashboardAttributeFilterByAttributeDisplayForms,
    findDashboardAttributeFilterByDisplayForm,
    findDashboardAttributeFilterByIncomingDisplayAsLabel,
    findDashboardAttributeFilterByTargetDisplayAsLabel,
} from "../../../../../model/utils/filterContextUtils.js";

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
