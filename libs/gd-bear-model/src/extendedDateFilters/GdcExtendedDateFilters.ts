// (C) 2019-2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";

/**
 * @public
 */
export namespace GdcExtendedDateFilters {
    // Generated unique identification string that is not subject to change during project copying.
    export type GUID = string;

    // Internal platform date string - ISO-8601 calendar date string, eg.: '2018-12-30'
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
        type: "absolute" | "relative";
        optionLocalIdentifier: string;
        granularity: DateFilterGranularity;
    }

    /**
     * Types for server-side filter configuration
     */

    export interface IDateFilterBase {
        localIdentifier: GUID;
        name: string;
        visible: boolean;
    }

    export type IDateFilterAllTime = IDateFilterBase;

    export type IDateFilterAbsoluteForm = IDateFilterBase;

    export interface IDateFilterRelativeForm extends IDateFilterBase {
        granularities: DateFilterGranularity[];
    }

    export interface IDateFilterAbsolutePreset extends IDateFilterBase {
        from: DateString;
        to: DateString;
    }

    export interface IDateFilterRelativePreset extends IDateFilterBase {
        from: number;
        to: number;
        granularity: DateFilterGranularity;
    }

    export interface IDateFilterConfigContent {
        selectedOption: GUID;
        allTime?: IDateFilterAllTime;
        absoluteForm?: IDateFilterAbsoluteForm;
        relativeForm?: IDateFilterRelativeForm;
        absolutePresets?: IDateFilterAbsolutePreset[];
        relativePresets?: IDateFilterRelativePreset[];
    }

    export interface IDateFilterConfig {
        meta: GdcMetadata.IObjectMeta;
        content: IDateFilterConfigContent;
    }

    export interface IWrappedDateFilterConfig {
        dateFilterConfig: IDateFilterConfig;
    }

    export type DashboardDateFilterConfigMode = "readonly" | "hidden" | "active";

    export interface IDashboardAddedPresets {
        absolutePresets?: IDateFilterAbsolutePreset[];
        relativePresets?: IDateFilterRelativePreset[];
    }

    export interface IDashboardDateFilterConfig {
        filterName: string;
        mode: DashboardDateFilterConfigMode;
        hideOptions?: GUID[];
        hideGranularities?: DateFilterGranularity[];
        addPresets?: IDashboardAddedPresets;
    }

    export interface IDateFilterReference {
        dateFilterReference: {
            dataSet: string;
        };
    }

    export interface IAttributeFilterReference {
        attributeFilterReference: {
            displayForm: string;
        };
    }
}
