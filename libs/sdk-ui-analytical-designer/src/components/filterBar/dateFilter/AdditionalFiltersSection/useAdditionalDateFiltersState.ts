// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import { pickAdditionalDateFiltersRemovedByMigration } from "../../../../store/filter_bar/filter_bar_helpers.js";
import { FilterBarService } from "../../../../store/filter_bar/filter_bar_service.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
} from "../../../../store/filter_bar/filter_bar_types.js";
import { type IDateDatasetRefWithGranularities } from "../../../../typings/datasets.js";

export interface IAdditionalDateFiltersStateInit {
    additionalDateFilters: IAttributeFilter[];
    emptyDateValuesFilterMode: EmptyDateValuesFilterMode | undefined;
    migratedFilters?: string[];
}

/**
 * Local (not yet applied) state of the additional date filters section of a date filter picker, shared by
 * the filter bar date filter and the metric date filter.
 */
export function useAdditionalDateFiltersState({
    additionalDateFilters,
    emptyDateValuesFilterMode,
    migratedFilters = [],
}: IAdditionalDateFiltersStateInit) {
    const [selectedAdditionalDateFilters, setSelectedAdditionalDateFilters] = useState(additionalDateFilters);
    const [selectedEmptyDateValuesFilterMode, setSelectedEmptyDateValuesFilterMode] = useState<
        EmptyDateValuesFilterMode | undefined
    >(emptyDateValuesFilterMode);
    const [currentMigratedFilters, setCurrentMigratedFilters] = useState(migratedFilters);

    // "Only" empty values stands alone: the period and the additional filters are locked
    const isOtherFiltersDisabled = selectedEmptyDateValuesFilterMode === "only";

    /**
     * Re-points the additional filters at the new dataset's matching attributes, keeping their selection.
     * A dataset change is an edit, so the marks of an earlier change are replaced: the warning reports only
     * the filters this change drops.
     */
    const migrateToDateDataset = useCallback(
        (
            nextDateDatasetRef: ObjRef,
            dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[],
        ) => {
            setCurrentMigratedFilters(
                pickAdditionalDateFiltersRemovedByMigration(
                    nextDateDatasetRef,
                    selectedAdditionalDateFilters,
                    dateDatasetRefsWithGranularities,
                ),
            );
            setSelectedAdditionalDateFilters(
                FilterBarService.migrateAdditionalDateFilters(
                    nextDateDatasetRef,
                    selectedAdditionalDateFilters,
                    dateDatasetRefsWithGranularities,
                ),
            );
        },
        [selectedAdditionalDateFilters],
    );

    const dismissMigratedFilters = useCallback(() => setCurrentMigratedFilters([]), []);

    return {
        selectedAdditionalDateFilters,
        setSelectedAdditionalDateFilters,
        selectedEmptyDateValuesFilterMode,
        setSelectedEmptyDateValuesFilterMode,
        currentMigratedFilters,
        setCurrentMigratedFilters,
        isOtherFiltersDisabled,
        migrateToDateDataset,
        dismissMigratedFilters,
    };
}
