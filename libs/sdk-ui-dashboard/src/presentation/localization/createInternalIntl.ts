// (C) 2021 GoodData Corporation
import { createIntl, IntlShape } from "react-intl";
import { DefaultLocale, ILocale, pickCorrectWording } from "@gooddata/sdk-ui";

import { translations } from "./translations.js";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";

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
    return createIntl({ locale, messages: pickCorrectWording(translations[locale], settings) });
}
