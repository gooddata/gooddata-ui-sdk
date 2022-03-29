// (C) 2019-2022 GoodData Corporation
/**
 * This is an all-in-one package that has all GoodData.UI packages as dependencies and re-exports their public API.
 *
 * @remarks
 * The primary purpose of this package is to simplify migration from previous versions of GoodData.UI
 * that were all delivered in a single `@gooddata/react-components` package.
 *
 * @packageDocumentation
 */

// NOTE: import/export disabled for some packages as we have to fiddle with stuff that we copied from one
// package to another.

// eslint-disable-next-line import/export
export * from "@gooddata/sdk-model";
// eslint-disable-next-line import/export
export * from "@gooddata/sdk-backend-spi";
export * from "@gooddata/sdk-ui";
// eslint-disable-next-line import/export
export * from "@gooddata/sdk-ui-charts";
// eslint-disable-next-line import/export
export * from "@gooddata/sdk-ui-geo";
export * from "@gooddata/sdk-ui-pivot";
export * from "@gooddata/sdk-ui-filters";
export * from "@gooddata/sdk-ui-ext";

import {
    // override getColorMappingPredicate, it is exported by both charts and geo, so use the chart version
    getColorMappingPredicate,
} from "@gooddata/sdk-ui-charts";

import {
    // User
    IUser,
    userFullName,
    // Date filter configs
    DateString,
    AllTimeType,
    AbsoluteFormType,
    RelativeFormType,
    AbsolutePresetType,
    RelativePresetType,
    OptionType,
    RelativeGranularityOffset,
    DateFilterGranularity,
    IDateFilterOption,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
    IDateFilterConfig,
    isDateFilterGranularity,
    isAllTimeDateFilterOption,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-model";
export {
    getColorMappingPredicate,
    // User
    IUser,
    // eslint-disable-next-line import/export
    userFullName,
    // Date filter configs
    DateString,
    AllTimeType,
    AbsoluteFormType,
    RelativeFormType,
    AbsolutePresetType,
    RelativePresetType,
    OptionType,
    RelativeGranularityOffset,
    DateFilterGranularity,
    IDateFilterOption,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    IAbsoluteDateFilterForm,
    IRelativeDateFilterForm,
    IAllTimeDateFilterOption,
    IDateFilterConfig,
    // eslint-disable-next-line import/export
    isDateFilterGranularity,
    // eslint-disable-next-line import/export
    isAllTimeDateFilterOption,
    // eslint-disable-next-line import/export
    isAbsoluteDateFilterForm,
    // eslint-disable-next-line import/export
    isAbsoluteDateFilterPreset,
    // eslint-disable-next-line import/export
    isRelativeDateFilterForm,
    // eslint-disable-next-line import/export
    isRelativeDateFilterPreset,
};
