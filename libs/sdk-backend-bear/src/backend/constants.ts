// (C) 2020 GoodData Corporation
import { IUserSettings } from "@gooddata/sdk-backend-spi";

export const DEFAULT_LOCALE = "en-US";
export const ANONYMOUS_USER_ID = "Anonymous";

export const ANONYMOUS_USER_SETTINGS: IUserSettings = {
    locale: DEFAULT_LOCALE,
    userId: ANONYMOUS_USER_ID,
};
