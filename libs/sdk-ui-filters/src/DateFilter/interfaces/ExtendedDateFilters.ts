// (C) 2007-2020 GoodData Corporation
/* tslint:disable:no-namespace */

/**
 * @beta
 */
export namespace ExtendedDateFilters {
    export type GUID = string;

    // Date string - ISO-8601 calendar date string, eg.: '2018-12-30'
    export type DateString = string;

    export type AllTimeType = "allTime";
    export type AbsoluteFormType = "absoluteForm";
    export type RelativeFormType = "relativeForm";
    export type AbsolutePresetType = "absolutePreset";
    export type RelativePresetType = "relativePreset";

    export type OptionType =
        | AllTimeType
        | AbsoluteFormType
        | RelativeFormType
        | AbsolutePresetType
        | RelativePresetType;

    export type RelativeGranularityOffset = number;

    export type DateFilterGranularity =
        | "GDC.time.date"
        | "GDC.time.week_us"
        | "GDC.time.month"
        | "GDC.time.quarter"
        | "GDC.time.year";

    export interface IDateFilterOption {
        localIdentifier: GUID;
        name: string;
        type: OptionType;
        visible: boolean;
    }

    export interface IAbsoluteDateFilterPreset extends IDateFilterOption {
        type: AbsolutePresetType;
        from: DateString;
        to: DateString;
    }

    export interface IRelativeDateFilterPreset extends IDateFilterOption {
        type: RelativePresetType;
        granularity: DateFilterGranularity;
        from: RelativeGranularityOffset;
        to: RelativeGranularityOffset;
    }

    export interface IRelativeDateFilterPresetOfGranularity<Key extends DateFilterGranularity>
        extends IRelativeDateFilterPreset {
        granularity: Key;
    }

    export interface IAbsoluteDateFilterForm extends IDateFilterOption {
        type: AbsoluteFormType;
        from?: DateString;
        to?: DateString;
    }

    export interface IRelativeDateFilterForm extends IDateFilterOption {
        type: RelativeFormType;
        granularity?: DateFilterGranularity;
        availableGranularities: DateFilterGranularity[];
        from?: RelativeGranularityOffset;
        to?: RelativeGranularityOffset;
    }

    export interface IAllTimeDateFilter extends IDateFilterOption {
        type: AllTimeType;
    }

    export type AbsoluteDateFilterOption = IAbsoluteDateFilterForm | IAbsoluteDateFilterPreset;

    export const isAllTimeDateFilter = (option: DateFilterOption): option is IAllTimeDateFilter =>
        option ? option.type === "allTime" : false;

    export const isAbsoluteDateFilterForm = (option: DateFilterOption): option is IAbsoluteDateFilterForm =>
        option ? option.type === "absoluteForm" : false;

    export const isAbsoluteDateFilterPreset = (
        option: DateFilterOption,
    ): option is IAbsoluteDateFilterPreset => (option ? option.type === "absolutePreset" : false);

    export const isAbsoluteDateFilterOption = (
        option: DateFilterOption,
    ): option is AbsoluteDateFilterOption =>
        isAbsoluteDateFilterForm(option) || isAbsoluteDateFilterPreset(option);

    export type RelativeDateFilterOption = IRelativeDateFilterForm | IRelativeDateFilterPreset;

    export const isRelativeDateFilterForm = (option: DateFilterOption): option is IRelativeDateFilterForm =>
        option ? option.type === "relativeForm" : false;

    export const isRelativeDateFilterPreset = (
        option: DateFilterOption,
    ): option is IRelativeDateFilterPreset => (option ? option.type === "relativePreset" : false);

    export const isRelativeDateFilterOption = (
        option: DateFilterOption,
    ): option is RelativeDateFilterOption =>
        isRelativeDateFilterForm(option) || isRelativeDateFilterPreset(option);

    export type DateFilterOption = IAllTimeDateFilter | AbsoluteDateFilterOption | RelativeDateFilterOption;

    export type DateFilterRelativeOptionGroup = {
        // tslint:disable-next-line:array-type
        [key in DateFilterGranularity]?: IRelativeDateFilterPresetOfGranularity<key>[];
    };

    export interface IDateFilterOptionsByType {
        allTime?: IAllTimeDateFilter;
        absoluteForm?: IAbsoluteDateFilterForm;
        relativeForm?: IRelativeDateFilterForm;
        absolutePreset?: IAbsoluteDateFilterPreset[];
        relativePreset?: DateFilterRelativeOptionGroup;
    }

    export type DateFilterConfigMode = "readonly" | "hidden" | "active";
}

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
