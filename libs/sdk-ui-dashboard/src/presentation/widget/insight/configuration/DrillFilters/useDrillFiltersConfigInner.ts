// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { type SourceInsightFilterObjRef, type SourceMeasureFilterObjRef } from "@gooddata/sdk-model";

import { type IDrillFiltersConfigOption } from "./types.js";
import { isSourceInsightFilterObjRefEqual } from "../../../../../_staging/drills/drillingUtils.js";
import { type IDrillFiltersConfigExtended } from "../../../../drill/types.js";

export type IDrillFiltersConfigSelection = Partial<
    IDrillFiltersConfigExtended & {
        drillIntersectionIgnoredAttributes: string[];
    }
>;

interface IUseDrillFiltersConfigInnerParams {
    intersectionAttributesOptions: IDrillFiltersConfigOption[];
    sourceInsightFiltersOptions: IDrillFiltersConfigOption[];
    sourceMeasureFiltersOptions: IDrillFiltersConfigOption[];
    dashboardFiltersOptions: IDrillFiltersConfigOption[];
    drillIntersectionIgnoredAttributes: string[];
    includedSourceInsightFiltersObjRefs: SourceInsightFilterObjRef[];
    ignoredDashboardFilters: string[];
    includedSourceMeasureFiltersObjRefs: SourceMeasureFilterObjRef[];
    onDrillFiltersChange: (selection: IDrillFiltersConfigSelection) => void;
}

export function useDrillFiltersConfigInner({
    intersectionAttributesOptions,
    sourceInsightFiltersOptions,
    sourceMeasureFiltersOptions,
    dashboardFiltersOptions,
    drillIntersectionIgnoredAttributes,
    includedSourceInsightFiltersObjRefs,
    ignoredDashboardFilters,
    includedSourceMeasureFiltersObjRefs,
    onDrillFiltersChange,
}: IUseDrillFiltersConfigInnerParams) {
    const intersectionSelection = useMemo(
        () =>
            intersectionAttributesOptions
                .map((option) => option.id)
                .filter((id) => !drillIntersectionIgnoredAttributes.includes(id)),
        [intersectionAttributesOptions, drillIntersectionIgnoredAttributes],
    );
    const sourceInsightSelection = useMemo(
        () =>
            sourceInsightFiltersOptions
                .filter((option) =>
                    includedSourceInsightFiltersObjRefs.some(
                        (includedFilter) =>
                            option.sourceInsightFilterObjRef &&
                            isSourceInsightFilterObjRefEqual(
                                includedFilter,
                                option.sourceInsightFilterObjRef,
                            ),
                    ),
                )
                .map((option) => option.id),
        [sourceInsightFiltersOptions, includedSourceInsightFiltersObjRefs],
    );
    const sourceMeasureSelection = useMemo(
        () =>
            sourceMeasureFiltersOptions
                .filter((option) =>
                    includedSourceMeasureFiltersObjRefs.some(
                        (includedFilter) =>
                            option.sourceMeasureFilterObjRef &&
                            isSourceInsightFilterObjRefEqual(
                                includedFilter,
                                option.sourceMeasureFilterObjRef,
                            ),
                    ),
                )
                .map((option) => option.id),
        [sourceMeasureFiltersOptions, includedSourceMeasureFiltersObjRefs],
    );
    const dashboardSelection = useMemo(
        () =>
            dashboardFiltersOptions
                .map((option) => option.id)
                .filter((id) => !ignoredDashboardFilters.includes(id)),
        [dashboardFiltersOptions, ignoredDashboardFilters],
    );

    const onIgnoredDrillAttributesChange = useCallback(
        (nextSelection: string[]) => {
            const selectedIntersectionAttributesSet = new Set(nextSelection);
            const nextIgnoredIntersectionAttributes = intersectionAttributesOptions
                .map((option) => option.id)
                .filter((optionId) => !selectedIntersectionAttributesSet.has(optionId));
            onDrillFiltersChange({
                drillIntersectionIgnoredAttributes: nextIgnoredIntersectionAttributes,
            });
        },
        [intersectionAttributesOptions, onDrillFiltersChange],
    );

    const onIncludedSourceInsightFiltersChange = useCallback(
        (nextSelection: string[]) => {
            const selectedSourceInsightFiltersSet = new Set(nextSelection);
            const nextIncludedSourceInsightFiltersObjRefs = sourceInsightFiltersOptions
                .filter((option) => selectedSourceInsightFiltersSet.has(option.id))
                .flatMap((option) =>
                    option.sourceInsightFilterObjRef ? [option.sourceInsightFilterObjRef] : [],
                );
            onDrillFiltersChange({
                includedSourceInsightFiltersObjRefs: nextIncludedSourceInsightFiltersObjRefs,
            });
        },
        [sourceInsightFiltersOptions, onDrillFiltersChange],
    );
    const onDashboardSelectionChange = useCallback(
        (nextSelection: string[]) => {
            const selectedDashboardFiltersSet = new Set(nextSelection);
            const nextIgnoredDashboardFilters = dashboardFiltersOptions
                .map((option) => option.id)
                .filter((optionId) => !selectedDashboardFiltersSet.has(optionId));
            onDrillFiltersChange({
                ignoredDashboardFilters: nextIgnoredDashboardFilters,
            });
        },
        [dashboardFiltersOptions, onDrillFiltersChange],
    );
    const onSourceMeasureSelectionChange = useCallback(
        (nextSelection: string[]) => {
            const selectedSourceMeasureFiltersSet = new Set(nextSelection);
            const nextIncludedSourceMeasureFiltersObjRefs = sourceMeasureFiltersOptions
                .filter((option) => selectedSourceMeasureFiltersSet.has(option.id))
                .flatMap((option) =>
                    option.sourceMeasureFilterObjRef ? [option.sourceMeasureFilterObjRef] : [],
                );
            onDrillFiltersChange({
                includedSourceMeasureFiltersObjRefs: nextIncludedSourceMeasureFiltersObjRefs,
            });
        },
        [sourceMeasureFiltersOptions, onDrillFiltersChange],
    );

    return {
        intersectionSelection,
        sourceInsightSelection,
        sourceMeasureSelection,
        dashboardSelection,
        onIgnoredDrillAttributesChange,
        onIncludedSourceInsightFiltersChange,
        onSourceMeasureSelectionChange,
        onDashboardSelectionChange,
    };
}
