// (C) 2007-2025 GoodData Corporation
import {
    DateString,
    DateFilterGranularity,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
    RelativeDateFilterGranularityOffset,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

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
 * Represents any option in the date filter dropdown
 * @public
 */
export type DateFilterOption = IAllTimeDateFilterOption | AbsoluteDateFilterOption | RelativeDateFilterOption;

/**
 * @internal
 */
export type DateParseError = "invalid" | "empty";

/**
 * @internal
 */
export type DateRangePosition = "from" | "to";

/**
 * Details of how the absolute date filter form option was changed.
 * Used for error validations.
 *
 * @internal
 */
export interface IAbsoluteDateFilterOptionChangedDetails {
    rangePosition: DateRangePosition;
    parseError?: DateParseError;
}

/**
 * Tests if provided object is {@link IAbsoluteDateFilterOptionChangedDetails}
 * @param obj - tested object
 * @returns true if provided object is of {@link IAbsoluteDateFilterOptionChangedDetails}, false if not
 */
export const isAbsoluteDateFilterOptionChangedDetails = (
    obj: unknown,
): obj is IAbsoluteDateFilterOptionChangedDetails =>
    !isEmpty(obj) && !isEmpty((obj as IAbsoluteDateFilterOptionChangedDetails).rangePosition);

/**
 * Details of how the date filter option was changed. Used for error validations and warnings.
 * Only information about absolute date filter option changes are supported now.
 *
 * @internal
 */
export type IDateFilterOptionChangedDetails = IAbsoluteDateFilterOptionChangedDetails;

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
 * Absolute form date time picker errors.
 *
 * @public
 */
export interface IDateTimePickerErrors {
    dateError?: string;
    timeError?: string;
}

/**
 * Absolute form date filter errors.
 *
 * @public
 */
export interface IDateFilterAbsoluteFormErrors {
    from?: string;
    to?: string;
}

/**
 * Absolute form date filter errors.
 *
 * @public
 */
export interface IDateFilterAbsoluteDateTimeFormErrors {
    from?: IDateTimePickerErrors;
    to?: IDateTimePickerErrors;
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
