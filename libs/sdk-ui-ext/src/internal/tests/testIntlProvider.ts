// (C) 2023-2025 GoodData Corporation

import { type IntlShape, createIntl } from "react-intl";

import { resolveLocaleDefaultMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "../utils/translations.js";

/**
 * @internal
 */
export function createIntlMock(customMessages = {}, locale = "en-US"): IntlShape {
    return createIntl({
        locale,
        messages: {
            ...resolveLocaleDefaultMessages(locale, DEFAULT_MESSAGES),
            ...customMessages,
        },
    });
}
