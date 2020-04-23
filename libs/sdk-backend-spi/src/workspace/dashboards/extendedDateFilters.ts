// (C) 2007-2020 GoodData Corporation

/**
 * TODO: remove ExtendedDateFilters from sdk-ui-filters and update imports in other files
 */

/**
 * TODO: docs
 * @public
 */
export type GUID = string;

/**
 * Date string - ISO-8601 calendar date string, eg.: '2018-12-30'
 * @public
 */
export type DateString = string;

/**
 * TODO: docs
 * @public
 */
export type AllTimeType = "allTime";

/**
 * TODO: docs
 * @public
 */
export type AbsoluteFormType = "absoluteForm";

/**
 * TODO: docs
 * @public
 */
export type RelativeFormType = "relativeForm";

/**
 * TODO: docs
 * @public
 */
export type AbsolutePresetType = "absolutePreset";

/**
 * TODO: docs
 * @public
 */
export type RelativePresetType = "relativePreset";

/**
 * TODO: docs
 * @public
 */
export type OptionType =
    | AllTimeType
    | AbsoluteFormType
    | RelativeFormType
    | AbsolutePresetType
    | RelativePresetType;

/**
 * TODO: docs
 * @public
 */
export type RelativeGranularityOffset = number;

/**
 * TODO: docs
 * @public
 */
export type DateFilterGranularity =
    | "GDC.time.date"
    | "GDC.time.week_us"
    | "GDC.time.month"
    | "GDC.time.quarter"
    | "GDC.time.year";

/**
 * TODO: docs
 * @public
 */
export interface IDateFilterOption {
    localIdentifier: GUID;
    name: string;
    type: OptionType;
    visible: boolean;
}

/**
 * TODO: docs
 * @public
 */
export interface IAbsoluteDateFilterPreset extends IDateFilterOption {
    type: AbsolutePresetType;
    from: DateString;
    to: DateString;
}

/**
 * TODO: docs
 * @public
 */
export interface IRelativeDateFilterPreset extends IDateFilterOption {
    type: RelativePresetType;
    granularity: DateFilterGranularity;
    from: RelativeGranularityOffset;
    to: RelativeGranularityOffset;
}

/**
 * TODO: docs
 * @public
 */
export interface IRelativeDateFilterPresetOfGranularity<Key extends DateFilterGranularity>
    extends IRelativeDateFilterPreset {
    granularity: Key;
}

/**
 * TODO: docs
 * @public
 */
export interface IAbsoluteDateFilterForm extends IDateFilterOption {
    type: AbsoluteFormType;
    from?: DateString;
    to?: DateString;
}

/**
 * TODO: docs
 * @public
 */
export interface IRelativeDateFilterForm extends IDateFilterOption {
    type: RelativeFormType;
    granularity?: DateFilterGranularity;
    availableGranularities: DateFilterGranularity[];
    from?: RelativeGranularityOffset;
    to?: RelativeGranularityOffset;
}

/**
 * TODO: docs
 * @public
 */
export interface IAllTimeDateFilter extends IDateFilterOption {
    type: AllTimeType;
}

/**
 * TODO: docs
 * @public
 */
export type AbsoluteDateFilterOption = IAbsoluteDateFilterForm | IAbsoluteDateFilterPreset;

/**
 * TODO: docs
 * @public
 */
export const isAllTimeDateFilter = (option: DateFilterOption): option is IAllTimeDateFilter =>
    option ? option.type === "allTime" : false;

/**
 * TODO: docs
 * @public
 */
export const isAbsoluteDateFilterForm = (option: DateFilterOption): option is IAbsoluteDateFilterForm =>
    option ? option.type === "absoluteForm" : false;

/**
 * TODO: docs
 * @public
 */
export const isAbsoluteDateFilterPreset = (option: DateFilterOption): option is IAbsoluteDateFilterPreset =>
    option ? option.type === "absolutePreset" : false;

/**
 * TODO: docs
 * @public
 */
export const isAbsoluteDateFilterOption = (option: DateFilterOption): option is AbsoluteDateFilterOption =>
    isAbsoluteDateFilterForm(option) || isAbsoluteDateFilterPreset(option);

/**
 * TODO: docs
 * @public
 */
export type RelativeDateFilterOption = IRelativeDateFilterForm | IRelativeDateFilterPreset;

/**
 * TODO: docs
 * @public
 */
export const isRelativeDateFilterForm = (option: DateFilterOption): option is IRelativeDateFilterForm =>
    option ? option.type === "relativeForm" : false;

/**
 * TODO: docs
 * @public
 */
export const isRelativeDateFilterPreset = (option: DateFilterOption): option is IRelativeDateFilterPreset =>
    option ? option.type === "relativePreset" : false;

/**
 * TODO: docs
 * @public
 */
export const isRelativeDateFilterOption = (option: DateFilterOption): option is RelativeDateFilterOption =>
    isRelativeDateFilterForm(option) || isRelativeDateFilterPreset(option);

/**
 * TODO: docs
 * @public
 */
export type DateFilterOption = IAllTimeDateFilter | AbsoluteDateFilterOption | RelativeDateFilterOption;

/**
 * TODO: docs
 * @public
 */
export type DateFilterRelativeOptionGroup = {
    // tslint:disable-next-line:array-type
    [key in DateFilterGranularity]?: IRelativeDateFilterPresetOfGranularity<key>[];
};

/**
 * TODO: docs
 * @public
 */
export interface IDateFilterOptionsByType {
    allTime?: IAllTimeDateFilter;
    absoluteForm?: IAbsoluteDateFilterForm;
    relativeForm?: IRelativeDateFilterForm;
    absolutePreset?: IAbsoluteDateFilterPreset[];
    relativePreset?: DateFilterRelativeOptionGroup;
}

/**
 * TODO: docs
 * @public
 */
export type DateFilterConfigMode = "readonly" | "hidden" | "active";

/**
 * TODO: docs
 * @public
 */
export interface IExtendedDateFilterErrors {
    absoluteForm?: {
        from?: string;
        to?: string;
    };
    relativeForm?: {
        from?: string;
        to?: string;
    };
}

/**
 * TODO: docs
 * @public
 */
export interface IDashboardAddedPresets {
    absolutePresets?: IAbsoluteDateFilterPreset[];
    relativePresets?: IRelativeDateFilterPreset[];
}
