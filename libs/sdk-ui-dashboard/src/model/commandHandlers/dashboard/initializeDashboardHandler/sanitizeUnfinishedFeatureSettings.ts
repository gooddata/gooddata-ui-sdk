// (C) 2021-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import { ISettings } from "@gooddata/sdk-model";

import { disabledUnfinishedFeatureSettings } from "../../../disabledUnfinishedFeatureSettings.js";

export const sanitizeUnfinishedFeatureSettings = (settings: ISettings | undefined): ISettings => {
    invariant(settings, "cannot sanitize undefined settings");
    return {
        ...settings,
        ...disabledUnfinishedFeatureSettings,
    };
};
