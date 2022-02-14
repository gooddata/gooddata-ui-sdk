// (C) 2021-2022 GoodData Corporation

import { ISettings } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";

import { disabledUnfinishedFeatureSettings } from "../../../disabledUnfinishedFeatureSettings";

export const sanitizeUnfinishedFeatureSettings = (settings: ISettings | undefined): ISettings => {
    invariant(settings, "cannot sanitize undefined settings");
    return {
        ...settings,
        ...disabledUnfinishedFeatureSettings,
    };
};
