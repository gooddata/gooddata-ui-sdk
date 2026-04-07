// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IFilter,
    type ObjRef,
    type SourceMeasureFilterObjRef,
    isLocalIdRef,
} from "@gooddata/sdk-model";

import { sourceInsightFilterObjRef as getSourceInsightFilterObjRef } from "../../../../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    canTransferAttributeFilterByDisplayForm,
    getDateDatasetTitle,
    getDisabledOptionProps,
    getDisabledOptionPropsForTransferResult,
    getDisplayFormTitle,
    hasMatchingTargetDashboardDateFilter,
    sourceFilterOptionId,
} from "../drillFiltersConfigUtils.js";
import { messages } from "../messages.js";
import { type IDrillFiltersConfigOption } from "../types.js";

interface IMapSourceMeasureFilterToOptionParams {
    sourceMeasureFilter: IFilter;
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    allCatalogDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
    targetDashboardFilters: FilterContextItem[];
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[];
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    isDrillToDashboard: boolean;
    intl: IntlShape;
}

export function mapSourceMeasureFilterToOption({
    sourceMeasureFilter,
    allCatalogDisplayFormsMap,
    allCatalogDateDatasets,
    targetDashboardFilters,
    targetDashboardAttributeFilters,
    targetDashboardTextAttributeFilters,
    targetDashboardAttributeFilterConfigs,
    isDrillToDashboard,
    intl,
}: IMapSourceMeasureFilterToOptionParams): IDrillFiltersConfigOption | undefined {
    const sourceFilterObjRef = getSourceInsightFilterObjRef(sourceMeasureFilter);
    if (!sourceFilterObjRef) {
        return undefined;
    }

    if (sourceFilterObjRef.type === "attributeFilter") {
        const displayFormRef = sourceFilterObjRef.label;
        if (isLocalIdRef(displayFormRef)) {
            return undefined;
        }
        // Measure filters are always list-type attribute filters (from execution model)
        const transferResult = canTransferAttributeFilterByDisplayForm(
            displayFormRef,
            false, // measure filters are list-type
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
            ...getDisabledOptionPropsForTransferResult(isDrillToDashboard, transferResult, intl),
            sourceMeasureFilterObjRef: sourceFilterObjRef as SourceMeasureFilterObjRef,
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
            ...getDisabledOptionProps(
                isDrillToDashboard && !hasMatchingTargetDateFilter,
                intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip),
                false,
            ),
            sourceMeasureFilterObjRef: sourceFilterObjRef as SourceMeasureFilterObjRef,
        };
    }

    return undefined;
}
