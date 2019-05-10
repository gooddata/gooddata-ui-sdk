// (C) 2019 GoodData Corporation
export namespace ExtendedDateFilters {
    // Generated unique identification string that is not subject to change during project copying.
    export type GUID = string;

    // Internal platform date string - ISO-8601 calendar date string, eg.: '2018-12-30'
    export type DateString = string;

    export type AllTimeType = 'allTime';
    export type AbsoluteFormType = 'absoluteForm';
    export type RelativeFormType = 'relativeForm';
    export type AbsolutePresetType = 'absolutePreset';
    export type RelativePresetType = 'relativePreset';

    export type OptionType =
        | AllTimeType
        | AbsoluteFormType
        | RelativeFormType
        | AbsolutePresetType
        | RelativePresetType;

    export type RelativeGranularityOffset = number;

    export type DateFilterGranularity =
        | 'GDC.time.date'
        | 'GDC.time.week_us'
        | 'GDC.time.month'
        | 'GDC.time.quarter'
        | 'GDC.time.year';

    export interface IDateFilterOption {
        localIdentifier: GUID;
        type: OptionType;
    }

    export interface IAbsoluteDateFilterPreset extends IDateFilterOption {
        name: string;
        type: AbsolutePresetType;
        from: DateString;
        to: DateString;
    }

    export interface IRelativeDateFilterPreset extends IDateFilterOption {
        name?: string;
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
        from?: RelativeGranularityOffset;
        to?: RelativeGranularityOffset;
    }

    export interface IAllTimeDateFilter extends IDateFilterOption {
        type: AllTimeType;
    }

    export type AbsoluteDateFilterOption =
        | IAbsoluteDateFilterForm
        | IAbsoluteDateFilterPreset;

    export const isAbsoluteDateFilterOption = (option: DateFilterOption): option is AbsoluteDateFilterOption =>
        option
            ? option.type === 'absoluteForm' || option.type === 'absolutePreset'
            : false;

    export type RelativeDateFilterOption =
        | IRelativeDateFilterForm
        | IRelativeDateFilterPreset;

    export const isRelativeDateFilterOption = (option: DateFilterOption): option is RelativeDateFilterOption =>
        option
            ? option.type === 'relativeForm' || option.type === 'relativePreset'
            : false;

    export type DateFilterOption =
        | IAllTimeDateFilter
        | AbsoluteDateFilterOption
        | RelativeDateFilterOption;

    export type DateFilterRelativeOptionGroup = {
        // tslint:disable-next-line:array-type
        [key in DateFilterGranularity]?: IRelativeDateFilterPresetOfGranularity<key>[]
    };

    export interface IDateFilterOptionsByType {
        allTime?: IAllTimeDateFilter;
        absoluteForm?: IAbsoluteDateFilterForm;
        relativeForm?: IRelativeDateFilterForm;
        absolutePreset?: IAbsoluteDateFilterPreset[];
        relativePreset?: DateFilterRelativeOptionGroup;
    }

    export interface IDefaultDateFilterOptions {
        selectedOption: GUID;
        optionsByType: IDateFilterOptionsByType;
    }

    /**
     * Backend model of date filter values.
     */
    export interface IDateFilterValue {
        from: string;
        to: string;
        type: 'absolute' | 'relative';
        optionLocalIdentifier: string;
        granularity: DateFilterGranularity;
    }
}
