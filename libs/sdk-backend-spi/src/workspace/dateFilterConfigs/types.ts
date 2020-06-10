// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ObjRef, Identifier } from "@gooddata/sdk-model";

/**
 * TODO: remove ExtendedDateFilters from sdk-ui-filters and update imports in other files
 * https://jira.intgdc.com/browse/RAIL-2413
 */

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
    localIdentifier: Identifier;
    name?: string;
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
}

/**
 * TODO: docs
 * @public
 */
export interface IRelativeDateFilterForm extends IDateFilterOption {
    type: RelativeFormType;
    availableGranularities: DateFilterGranularity[];
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
 * Type-guard testing whether the provided object is an instance of {@link IAllTimeDateFilter}.
 * @alpha
 */
export const isAllTimeDateFilter = (obj: any): obj is IAllTimeDateFilter =>
    !isEmpty(obj) && (obj as IAllTimeDateFilter).type === "allTime";

/**
 * Type-guard testing whether the provided object is an instance of {@link IAbsoluteDateFilterForm}.
 * @alpha
 */
export const isAbsoluteDateFilterForm = (obj: any): obj is IAbsoluteDateFilterForm =>
    !isEmpty(obj) && (obj as IAbsoluteDateFilterForm).type === "absoluteForm";

/**
 * Type-guard testing whether the provided object is an instance of {@link IAbsoluteDateFilterPreset}.
 * @alpha
 */
export const isAbsoluteDateFilterPreset = (obj: any): obj is IAbsoluteDateFilterPreset =>
    !isEmpty(obj) && (obj as IAbsoluteDateFilterPreset).type === "absolutePreset";

/**
 * Type-guard testing whether the provided object is an instance of {@link AbsoluteDateFilterOption}.
 * @alpha
 */
export const isAbsoluteDateFilterOption = (obj: any): obj is AbsoluteDateFilterOption =>
    isAbsoluteDateFilterForm(obj) || isAbsoluteDateFilterPreset(obj);

/**
 * TODO: docs
 * @public
 */
export type RelativeDateFilterOption = IRelativeDateFilterForm | IRelativeDateFilterPreset;

/**
 * Type-guard testing whether the provided object is an instance of {@link IRelativeDateFilterForm}.
 * @alpha
 */
export const isRelativeDateFilterForm = (obj: any): obj is IRelativeDateFilterForm =>
    !isEmpty(obj) && (obj as IRelativeDateFilterForm).type === "relativeForm";

/**
 * Type-guard testing whether the provided object is an instance of {@link IRelativeDateFilterPreset}.
 * @alpha
 */
export const isRelativeDateFilterPreset = (obj: any): obj is IRelativeDateFilterPreset =>
    !isEmpty(obj) && (obj as IRelativeDateFilterPreset).type === "relativePreset";

/**
 * Type-guard testing whether the provided object is an instance of {@link RelativeDateFilterOption}.
 * @alpha
 */
export const isRelativeDateFilterOption = (obj: any): obj is RelativeDateFilterOption =>
    isRelativeDateFilterForm(obj) || isRelativeDateFilterPreset(obj);

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
    [key in DateFilterGranularity]?: Array<IRelativeDateFilterPresetOfGranularity<key>>;
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

/**
 * Date filter configs allow to define your own date filter presets, that appear in the date filter.
 *
 * @alpha
 */
export interface IDateFilterConfig {
    ref: ObjRef;
    selectedOption: Identifier;
    allTime?: IAllTimeDateFilter;
    absoluteForm?: IAbsoluteDateFilterForm;
    relativeForm?: IRelativeDateFilterForm;
    absolutePresets?: IAbsoluteDateFilterPreset[];
    relativePresets?: IRelativeDateFilterPreset[];
}
