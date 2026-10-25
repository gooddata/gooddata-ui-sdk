// (C) 2026 GoodData Corporation

import { type ISettings, type IUserSettings } from "@gooddata/sdk-model";

/** The complete user settings the feature-flags action carries, seeded with the flags under test. */
export function userSettings(flags: ISettings): IUserSettings {
    return {
        userId: "user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
        ...flags,
    };
}
