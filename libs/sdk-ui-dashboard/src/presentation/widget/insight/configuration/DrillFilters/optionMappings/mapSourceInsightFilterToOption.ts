// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogMeasure,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardMeasureValueFilter,
    type IFilter,
    type IMeasure,
    type ObjRef,
    isArbitraryAttributeFilter,
    isLocalIdRef,
    isMatchAttributeFilter,
    isRankingFilter,
} from "@gooddata/sdk-model";

import {
    sourceInsightFilterObjRef as getSourceInsightFilterObjRef,
    resolveSourceMeasureRef,
} from "../../../../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    canTransferAttributeFilterByDisplayForm,
    getDateDatasetTitle,
    getDisabledOptionProps,
    getDisabledOptionPropsForTransferResult,
    getDisplayFormTitle,
    getMeasureTitleFromSourceInsightMeasures,
    hasMatchingTargetDashboardDateFilter,
    hasMatchingTargetDashboardMeasureValueFilter,
    sourceFilterOptionId,
} from "../drillFiltersConfigUtils.js";
import { messages } from "../messages.js";
import { type IDrillFiltersConfigOption } from "../types.js";

interface IMapSourceInsightFilterToOptionParams {
    sourceInsightFilter: IFilter;
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    allCatalogDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
    sourceInsightMeasures: IMeasure[];
    allCatalogMeasures: ICatalogMeasure[];
    targetDashboardFilters: FilterContextItem[];
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[];
    targetDashboardMeasureValueFilters: IDashboardMeasureValueFilter[];
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    isDrillDown: boolean;
    isDrillToDashboard: boolean;
    enableMeasureValueFilter: boolean;
    intl: IntlShape;
}

export function mapSourceInsightFilterToOption({
    sourceInsightFilter,
    allCatalogDisplayFormsMap,
    allCatalogDateDatasets,
    sourceInsightMeasures,
    allCatalogMeasures,
    targetDashboardFilters,
    targetDashboardAttributeFilters,
    targetDashboardTextAttributeFilters,
    targetDashboardMeasureValueFilters,
    targetDashboardAttributeFilterConfigs,
    isDrillDown,
    isDrillToDashboard,
    enableMeasureValueFilter,
    intl,
}: IMapSourceInsightFilterToOptionParams): IDrillFiltersConfigOption | undefined {
    const sourceFilterObjRef = getSourceInsightFilterObjRef(sourceInsightFilter);
    if (!sourceFilterObjRef) {
        return undefined;
    }

    const disabled = getDisabledOptionProps(
        isDrillDown,
        intl.formatMessage(messages.drillDownInsightFilterTooltip),
        true,
    );

    const rankingFilterDisabled = isDrillDown
        ? disabled
        : getDisabledOptionProps(
              true,
              isDrillToDashboard
                  ? intl.formatMessage(messages.drillToDashboardRankingFilterTooltip)
                  : intl.formatMessage(messages.rankingFilterTooltip),
              false,
          );

    if (sourceFilterObjRef.type === "attributeFilter") {
        const displayFormRef = sourceFilterObjRef.label;
        if (isLocalIdRef(displayFormRef)) {
            return undefined;
        }
        const isSourceTextFilter =
            isArbitraryAttributeFilter(sourceInsightFilter) || isMatchAttributeFilter(sourceInsightFilter);
        const transferResult = canTransferAttributeFilterByDisplayForm(
            displayFormRef,
            isSourceTextFilter,
            targetDashboardAttributeFilters,
            targetDashboardAttributeFilterConfigs,
            targetDashboardTextAttributeFilters,
        );

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDisplayFormTitle({
                displayFormRef,
                allCatalogDisplayFormsMap,
            }),
            ...disabled,
            ...getDisabledOptionPropsForTransferResult(isDrillToDashboard, transferResult, intl),
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "dateFilter") {
        const dateDatasetRef = sourceFilterObjRef.dataSet;

        if (isLocalIdRef(dateDatasetRef)) {
            return undefined;
        }

        const hasMatchingTargetDateFilter = hasMatchingTargetDashboardDateFilter(
            dateDatasetRef,
            targetDashboardFilters,
        );

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDateDatasetTitle({
                datasetRef: dateDatasetRef,
                allCatalogDateDatasets,
            }),
            ...disabled,
            ...getDisabledOptionProps(
                isDrillToDashboard && !hasMatchingTargetDateFilter,
                intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip),
                false,
            ),
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "measureValueFilter") {
        const measureRef = sourceFilterObjRef.measure;
        const dashboardMeasureRef = resolveSourceMeasureRef(measureRef, sourceInsightMeasures);

        const hasMatchingTargetMeasureValueFilter = hasMatchingTargetDashboardMeasureValueFilter(
            dashboardMeasureRef,
            targetDashboardMeasureValueFilters,
        );
        const measureTitleFromInsight = getMeasureTitleFromSourceInsightMeasures(
            sourceInsightMeasures,
            measureRef,
            allCatalogMeasures,
            intl,
        );

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: measureTitleFromInsight ?? "",
            ...(dashboardMeasureRef ? { metricFilterMeasureRef: dashboardMeasureRef } : {}),
            ...disabled,
            ...getDisabledOptionProps(
                isDrillToDashboard && (!enableMeasureValueFilter || !hasMatchingTargetMeasureValueFilter),
                intl.formatMessage(
                    enableMeasureValueFilter
                        ? messages.drillToDashboardDashboardFilterTooltip
                        : messages.drillToDashboardMetricFilterTooltip,
                ),
                false,
            ),
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "rankingFilter" && isRankingFilter(sourceInsightFilter)) {
        const measureRef = sourceFilterObjRef.measure;
        const measureTitleFromInsight = getMeasureTitleFromSourceInsightMeasures(
            sourceInsightMeasures,
            measureRef,
            allCatalogMeasures,
            intl,
        );
        const rankingPreviewMessage =
            sourceInsightFilter.rankingFilter.operator === "TOP"
                ? messages.rankingFilterPreviewTopWithoutAttributePlain
                : messages.rankingFilterPreviewBottomWithoutAttributePlain;

        const title = intl.formatMessage(rankingPreviewMessage, {
            value: sourceInsightFilter.rankingFilter.value,
            measure: measureTitleFromInsight ?? "",
        });

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title,
            ...rankingFilterDisabled,
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    return undefined;
}
