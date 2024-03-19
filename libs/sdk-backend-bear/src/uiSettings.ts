// (C) 2023-2024 GoodData Corporation

import { ISettings } from "@gooddata/sdk-model";

/**
 * Hardcoded UI settings that are configurable on Tiger or hardcoded on both backends.
 */
export const DefaultUiSettings: ISettings = {
    metadataTimeZone: "Europe/Prague", // Bear metadata are always stored in Prague time zone
    keepInsightName: true,
    enableNewHeadline: true,
};
