// (C) 2007-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IntlShape, MessageDescriptor, createIntl } from "react-intl";

import { DefaultLocale, ILocale } from "./Locale.js";
import { messagesMap } from "./messagesMap.js";

const intlStore: { [key in ILocale]?: IntlShape } = {};

/**
 * Gets react-intl's IntlShape set up for the provided locale.
 *
 * @param locale - one of the supported locales, if not specified returns shape for `DefaultLocale`
 * @internal
 */
export function getIntl(locale: ILocale = DefaultLocale): IntlShape {
    let usedLocale = locale;
    if (isEmpty(locale)) {
        usedLocale = DefaultLocale;
    }
    return (
        intlStore[usedLocale] ||
        (intlStore[usedLocale] = createIntl({
            locale: usedLocale,
            messages: messagesMap[locale],
        }))
    );
}

/**
 * Convenience function to return translated and formatted string for given key and locale; optionally specify
 * values of parameters to substitute in the translated string.
 *
 * @param translationId - id of the localized string
 * @param locale - target locale
 * @param values - parameters, optional
 *
 * @internal
 */
export function getTranslation(
    translationId: string | MessageDescriptor,
    locale: ILocale,
    values = {},
): string {
    const intl = getIntl(locale);
    const desc =
        typeof translationId === "object"
            ? { ...translationId, defaultMessage: translationId.id }
            : { id: translationId, defaultMessage: translationId };
    return intl.formatMessage(desc, values);
}
