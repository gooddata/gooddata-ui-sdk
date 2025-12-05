// (C) 2021-2025 GoodData Corporation

import { IntlShape, createIntl } from "react-intl";

import { DefaultLocale, ILocale, resolveLocaleDefaultMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "./translations.js";

/**
 * Test intl utils
 * @internal
 */
export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    return createIntl({
        locale,
        messages: resolveLocaleDefaultMessages(locale, DEFAULT_MESSAGES),
    });
}
