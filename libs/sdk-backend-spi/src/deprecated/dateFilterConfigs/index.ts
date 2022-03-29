// (C) 2007-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Date string - ISO-8601 calendar date string, eg.: '2018-12-30'
 * TODO: https://jira.intgdc.com/browse/RAIL-2415
 * @deprecated Use {@link @gooddata/sdk-model#DateString}
 * @alpha
 */
export type DateString = m.DateString;

/**
 * Type that identifies the the all time date filter
 * @deprecated Use {@link @gooddata/sdk-model#AllTimeType}
 * @alpha
 */
export type AllTimeType = m.AllTimeType;

/**
 * Type that identifies the absolute date filter form
 * @deprecated Use {@link @gooddata/sdk-model#AbsoluteFormType}
 * @alpha
 */
export type AbsoluteFormType = m.AbsoluteFormType;

/**
 * Type that identifies the relative date filter form
 * @deprecated Use {@link @gooddata/sdk-model#RelativeFormType}
 * @alpha
 */
export type RelativeFormType = m.RelativeFormType;

/**
 * Type that identifies the absolute date filter preset
 * @deprecated Use {@link @gooddata/sdk-model#AbsolutePresetType}
 * @alpha
 */
export type AbsolutePresetType = m.AbsolutePresetType;

/**
 * Type that identifies the relative date filter preset
 * @deprecated Use {@link @gooddata/sdk-model#RelativePresetType}
 * @alpha
 */
export type RelativePresetType = m.RelativePresetType;

/**
 * Type that identifies the date filter option
 * @deprecated Use {@link @gooddata/sdk-model#OptionType}
 * @alpha
 */
export type OptionType = m.OptionType;

/**
 * Relative granularity offset
 * (e.g. "GDC.time.year" granularity with offset -2 means "the previous 2 years")
 * @deprecated Use {@link @gooddata/sdk-model#RelativeGranularityOffset}
 * @alpha
 */
export type RelativeGranularityOffset = m.RelativeGranularityOffset;

/**
 * Supported date filter granularity for the relative date filter
 * @deprecated Use {@link @gooddata/sdk-model#DateFilterGranularity}
 * @alpha
 */
export type DateFilterGranularity = m.DateFilterGranularity;

/**
 * Type-guard testing whether the provided object is an instance of {@link DateFilterGranularity}.
 * @deprecated Use {@link @gooddata/sdk-model#isDateFilterGranularity}
 * @alpha
 */
export const isDateFilterGranularity = m.isDateFilterGranularity;

/**
 * Common props for date filter options
 * @deprecated Use {@link @gooddata/sdk-model#IDateFilterOption}
 * @alpha
 */
//
export interface IDateFilterOption extends m.IDateFilterOption {}

/**
 * Custom absolute date filter preset
 * @deprecated Use {@link @gooddata/sdk-model#IAbsoluteDateFilterPreset}
 * @alpha
 */
export interface IAbsoluteDateFilterPreset extends m.IAbsoluteDateFilterPreset {}

/**
 * Custom relative date filter preset
 * @deprecated Use {@link @gooddata/sdk-model#IRelativeDateFilterPreset}
 * @alpha
 */
export interface IRelativeDateFilterPreset extends m.IRelativeDateFilterPreset {}

/**
 * Generic type to express relative date filter preset of a particular granularity
 * @deprecated Use {@link @gooddata/sdk-model#IRelativeDateFilterPresetOfGranularity}
 * @alpha
 */
export interface IRelativeDateFilterPresetOfGranularity<Key extends DateFilterGranularity>
    extends m.IRelativeDateFilterPresetOfGranularity<Key> {}

/**
 * Customized options for the global absolute date filter
 * @deprecated Use {@link @gooddata/sdk-model#IAbsoluteDateFilterForm}
 * @alpha
 */
export interface IAbsoluteDateFilterForm extends m.IAbsoluteDateFilterForm {}

/**
 * Customized options for the global relative date filter
 * @deprecated Use {@link @gooddata/sdk-model#IRelativeDateFilterForm}
 * @alpha
 */
export interface IRelativeDateFilterForm extends m.IRelativeDateFilterForm {}

/**
 * Customized options for the global all time date filter
 * @deprecated Use {@link @gooddata/sdk-model#IAllTimeDateFilterOption}
 * @alpha
 */
export interface IAllTimeDateFilterOption extends m.IAllTimeDateFilterOption {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IAllTimeDateFilterOption}.
 * @deprecated Use {@link @gooddata/sdk-model#isAllTimeDateFilterOption}
 * @alpha
 */
export const isAllTimeDateFilterOption = m.isAllTimeDateFilterOption;

/**
 * Type-guard testing whether the provided object is an instance of {@link IAbsoluteDateFilterForm}.
 * @deprecated Use {@link @gooddata/sdk-model#isAbsoluteDateFilterForm}
 * @alpha
 */
export const isAbsoluteDateFilterForm = m.isAbsoluteDateFilterForm;

/**
 * Type-guard testing whether the provided object is an instance of {@link IAbsoluteDateFilterPreset}.
 * @deprecated Use {@link @gooddata/sdk-model#isAbsoluteDateFilterPreset}
 * @alpha
 */
export const isAbsoluteDateFilterPreset = m.isAbsoluteDateFilterPreset;

/**
 * Type-guard testing whether the provided object is an instance of {@link IRelativeDateFilterForm}.
 * @deprecated Use {@link @gooddata/sdk-model#isRelativeDateFilterForm}
 * @alpha
 */
export const isRelativeDateFilterForm = m.isRelativeDateFilterForm;

/**
 * Type-guard testing whether the provided object is an instance of {@link IRelativeDateFilterPreset}.
 * @deprecated Use {@link @gooddata/sdk-model#isRelativeDateFilterPreset}
 * @alpha
 */
export const isRelativeDateFilterPreset = m.isRelativeDateFilterPreset;

/**
 * Date filter configs allow to define your own date filter options, that appear in the date filter.
 * @deprecated Use {@link @gooddata/sdk-model#IDateFilterConfig}
 * @alpha
 */
export interface IDateFilterConfig extends m.IDateFilterConfig {}
