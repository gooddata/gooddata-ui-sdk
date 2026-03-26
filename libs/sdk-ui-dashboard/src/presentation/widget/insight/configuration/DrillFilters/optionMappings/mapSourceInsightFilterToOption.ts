// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogMeasure,
    type IDashboardAttributeFilter,
    type IFilter,
    type IMeasure,
    type ObjRef,
    isLocalIdRef,
    isRankingFilter,
} from "@gooddata/sdk-model";

import { sourceInsightFilterObjRef as getSourceInsightFilterObjRef } from "../../../../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    getDateDatasetTitle,
    getDisabledOptionProps,
    getDisplayFormTitle,
    getMeasureTitleFromSourceInsightMeasures,
    hasMatchingTargetDashboardAttributeFilterDisplayForm,
    hasMatchingTargetDashboardDateFilter,
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
    isDrillDown: boolean;
    isDrillToDashboard: boolean;
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
    isDrillDown,
    isDrillToDashboard,
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
        const hasMatchingTargetAttributeFilter = hasMatchingTargetDashboardAttributeFilterDisplayForm(
            displayFormRef,
            targetDashboardAttributeFilters,
        );

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDisplayFormTitle({
                displayFormRef,
                allCatalogDisplayFormsMap,
            }),
            ...disabled,
            ...getDisabledOptionProps(
                isDrillToDashboard && !hasMatchingTargetAttributeFilter,
                intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip),
                false,
            ),
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
        const measureTitleFromInsight = getMeasureTitleFromSourceInsightMeasures(
            sourceInsightMeasures,
            measureRef,
            allCatalogMeasures,
            intl,
        );

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: measureTitleFromInsight ?? "",
            ...(isDrillToDashboard
                ? getDisabledOptionProps(
                      true,
                      intl.formatMessage(messages.drillToDashboardMetricFilterTooltip),
                      false,
                  )
                : disabled),
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
