// (C) 2021 GoodData Corporation
import { createIntl, IntlShape } from "react-intl";
import { DefaultLocale, ILocale } from "@gooddata/sdk-ui";
import { translations } from "./IntlWrapper";

/**
 * @internal
 */
export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    return createIntl({ locale, messages: translations[locale] });
}
