// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type DateFilterGranularity,
    type DateString,
    type EmptyValues,
    type IAbsoluteDateFilterForm,
    type IAbsoluteDateFilterPreset,
    type IAllTimeDateFilterOption,
    type IEmptyValuesDateFilterOption,
    type ILowerBoundedFilter,
    type IRelativeDateFilterForm,
    type IRelativeDateFilterPreset,
    type IRelativeDateFilterPresetOfGranularity,
    type IUpperBoundedFilter,
    type RelativeDateFilterGranularityOffset,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";

/**
 * Represents the global absolute date filter, which may contain selected values
 * @public
 */
export interface IUiAbsoluteDateFilterForm extends IAbsoluteDateFilterForm {
    /**
     * Selected global absolute date filter start date
     */
    from?: DateString;
    /**
     * Selected global absolute date filter end date
     */
    to?: DateString;
    /**
     * Optional configuration for how this option should treat empty date values.
     */
    emptyValueHandling?: EmptyValues;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IUiRelativeDateFilterForm}.
 * @public
 */
export const isUiRelativeDateFilterForm = (obj: unknown): obj is IUiRelativeDateFilterForm => {
    return !isEmpty(obj) && (obj as IUiRelativeDateFilterForm).type === "relativeForm";
};

/**
 * Represents the global relative date filter, which may contain selected granularity and values
 * @public
 */
export interface IUiRelativeDateFilterForm extends Omit<IRelativeDateFilterForm, "availableGranularities"> {
    /**
     * Selected global relative date filter granularity
     */
    granularity?: DateFilterGranularity;
    /**
     * Selected global relative date filter granularity start offset
     */
    from?: RelativeDateFilterGranularityOffset;
    /**
     * Selected global relative date filter granularity end offset
     */
    to?: RelativeDateFilterGranularityOffset;
    /**
     * Additional bound for the relative date filter
     */
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
    /**
     * Optional configuration for how this option should treat empty date values.
     */
    emptyValueHandling?: EmptyValues;
}

/**
 * Represents a absolute date filter option in the date filter dropdown
 * @public
 */
export type AbsoluteDateFilterOption = IUiAbsoluteDateFilterForm | IAbsoluteDateFilterPreset;

/**
 * Type-guard testing whether the provided object is an instance of {@link AbsoluteDateFilterOption}.
 * @public
 */
export const isAbsoluteDateFilterOption = (obj: unknown): obj is AbsoluteDateFilterOption =>
    isAbsoluteDateFilterForm(obj) || isAbsoluteDateFilterPreset(obj);

/**
 * Represents a relative date filter option in the date filter dropdown
 * @public
 */
export type RelativeDateFilterOption = IUiRelativeDateFilterForm | IRelativeDateFilterPreset;

/**
 * Type-guard testing whether the provided object is an instance of {@link RelativeDateFilterOption}.
 * @public
 */
export const isRelativeDateFilterOption = (obj: unknown): obj is RelativeDateFilterOption =>
    isRelativeDateFilterForm(obj) || isRelativeDateFilterPreset(obj);

/**
 * Type-guard testing whether the provided object is an instance of {@link RelativeDateFilterOption} with boundedFilter.
 * @public
 */
export const isRelativeDateFilterWithBoundOption = (obj: unknown): obj is RelativeDateFilterOption =>
    isRelativeDateFilterOption(obj) && !isEmpty(obj.boundedFilter);

/**
 * Represents any option in the date filter dropdown
 * @public
 */
export type DateFilterOption =
    | IAllTimeDateFilterOption
    | IEmptyValuesDateFilterOption
    | AbsoluteDateFilterOption
    | RelativeDateFilterOption;

/**
 * @internal
 */
export type DateRangePosition = "from" | "to";

/**
 * Relative date filter options grouped by their granularity
 * @public
 */
export type DateFilterRelativeOptionGroup = {
    [key in DateFilterGranularity]?: Array<IRelativeDateFilterPresetOfGranularity<key>>;
};

/**
 * All date filter options grouped by their type
 * @public
 */
export interface IDateFilterOptionsByType {
    /**
     * Global all time date filter options
     */
    allTime?: IAllTimeDateFilterOption;
    /**
     * Preset for filtering only empty date values (records with no date)
     */
    emptyValues?: IEmptyValuesDateFilterOption;
    /**
     * Global absolute date filter options
     */
    absoluteForm?: IUiAbsoluteDateFilterForm;
    /**
     * Global relative date filter options
     */
    relativeForm?: IUiRelativeDateFilterForm;
    /**
     * Custom absolute date filter presets
     */
    absolutePreset?: IAbsoluteDateFilterPreset[];
    /**
     * Custom relative date filter presets
     */
    relativePreset?: DateFilterRelativeOptionGroup;
}

/**
 * Absolute form date filter errors.
 *
 * @public
 */
export interface IDateFilterAbsoluteDateTimeFormErrors {
    invalidStartDate?: boolean;
    invalidEndDate?: boolean;
    startDateAfterEndDate?: boolean;
}

/**
 * Relative form date filter errors.
 *
 * @public
 */
export interface IDateFilterRelativeFormErrors {
    from?: string;
    to?: string;
}

/**
 * Extended date filter errors
 * @public
 */
export interface IExtendedDateFilterErrors {
    /**
     * Global absolute date filter errors
     */
    absoluteForm?: IDateFilterAbsoluteDateTimeFormErrors;
    /**
     * Global relative date filter errors
     */
    relativeForm?: IDateFilterRelativeFormErrors;
}
