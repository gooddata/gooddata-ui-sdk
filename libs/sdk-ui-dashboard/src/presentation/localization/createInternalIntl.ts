// (C) 2021-2025 GoodData Corporation
import { IntlShape, createIntl } from "react-intl";

import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { DefaultLocale, ILocale, pickCorrectWording, resolveLocaleDefaultMessages } from "@gooddata/sdk-ui";

import { translations } from "./translations.js";
/**
 * Test intl utils
 * @internal
 */
export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    /**
     * Because of issues described in the ticket FET-855, we decided to use this workaround.
     * After the issues that are described in the ticket are solved or at least reduced,
     * this workaround can be removed.
     */
    const settings = window.gdSettings as IWorkspaceSettings;
    return createIntl({
        locale,
        messages: pickCorrectWording(resolveLocaleDefaultMessages(locale, translations), settings),
    });
}
