// (C) 2022-2026 GoodData Corporation

import { type IActiveCalendars, type ObjRef, type WeekStart } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";
import { type DateFilterOption, type DateFilterRelativeOptionGroup } from "@gooddata/sdk-ui-filters";

import { type IDecoratedDateDataset } from "../../../models/decorated_date_dataset.js";
import { type IDecoratedDateDatasets } from "../../../models/decorated_date_datasets.js";
import { type IAdditionalDateFilterLabel } from "../../../selectors/additional_date_filter_selector.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IDateDatasetRefWithGranularities } from "../../../typings/datasets.js";

import { type IDateFilterOption } from "./dateFilterOptionFactory.js";

export interface IComparisonCompatibleMeasure {
    localIdentifier: string;
    sequenceNumber: number;
    title: string;
    alias?: string;
}

export interface IUpdateDateFilterPayload {
    filter: DateFilterOption;
    dateDatasetRef: ObjRef;
    overTimeComparisonType: OverTimeComparisonType;
    overTimeComparisonMeasures: string[];
    additionalDateAttributeFilters: IAttributeFilter[];
    isCurrentPeriodExcluded: boolean;
    emptyDateValuesFilter?: EmptyDateValuesFilterMode;
}

export interface IDateFilterProps {
    filterLocalIdentifier: string;
    onApply: (payload: IUpdateDateFilterPayload) => void;
    onClose: () => void;
    className?: string;
    isDragged?: boolean;
    /** the user just added this filter, so its picker opens right away */
    isAutoOpen?: boolean;
}

export interface IDateFilterStateProps {
    filter: IDateFilterOption;
    relativeDateFilterPresets: DateFilterRelativeOptionGroup;
    dateDataset: IDecoratedDateDataset;
    dateDatasets: IDecoratedDateDatasets;
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[];
    isDateDatasetDisabled: boolean;
    dateFormat: string;
    timeComparisonType: OverTimeComparisonType;
    timeComparisonMeasures: string[];
    supportedTimeComparisonTypes: OverTimeComparisonType[];
    isWeekFiltersEnabled: boolean;
    timeComparisonCompatibleMeasures: IComparisonCompatibleMeasure[];
    isUsedByInsight: boolean;
    dateBucketItemDateDatasetRefs: ObjRef[];
    isDateDatasetsDropdownLoaded: boolean;
    areGenericDateAttributeElementsSupported: boolean;
    additionalDateAttributeFilters: IAttributeFilter[];
    additionalDateFilterLabels: IAdditionalDateFilterLabel[];
    migratedAdditionalFilters: string[];
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsGranularityEnabled: boolean;
    enableUnavailableItemsVisibility: boolean;
    storedEmptyDateValuesFilter?: EmptyDateValuesFilterMode;
    activeCalendars?: IActiveCalendars;
    formatLocale?: string;
    weekStart?: WeekStart;
    isFirstDateFilter: boolean;
}
