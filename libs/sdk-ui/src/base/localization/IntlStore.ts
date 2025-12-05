// (C) 2007-2023 GoodData Corporation
import { IntlShape, MessageDescriptor, createIntl } from "react-intl";

import { DefaultLocale, ILocale } from "./Locale.js";
//import { resolveMessages } from "./messagesMap.js";
//import { messagesMap } from "./messagesMap.js";

const intlStore: { [key in ILocale]?: IntlShape } = {};

/**
 * Gets react-intl's IntlShape set up for the provided locale and messages
 *
 * @param locale - one of the supported locales, if not specified returns shape for `DefaultLocale`
 * @param messages - messages to use for the intl shape
 * @internal
 */
export function getIntl(locale: ILocale = DefaultLocale, messages: Record<string, string>): IntlShape {
    return (
        intlStore[locale] ||
        (intlStore[locale] = createIntl({
            locale,
            messages: messages,
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
    messages: Record<string, string>,
    values = {},
): string {
    const intl = getIntl(locale, messages);
    const desc =
        typeof translationId === "object"
            ? { ...translationId, defaultMessage: translationId.id }
            : { id: translationId, defaultMessage: translationId };
    return intl.formatMessage(desc, values);
}
