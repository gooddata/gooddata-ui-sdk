// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IntlProvider, createIntl, IntlShape } from "react-intl";
import { ITranslations, messagesMap } from "./messagesMap.js";
import { DefaultLocale, ILocale, isLocale } from "./Locale.js";
import { wrapDisplayName } from "../react/wrapDisplayName.js";

/**
 * @internal
 */
export function createIntlMock(customMessages = {}, locale = "en-US"): IntlShape {
    return createIntl({
        locale,
        messages: {
            ...messagesMap[locale],
            ...customMessages,
        },
    });
}

/**
 * @internal
 */
export function withIntl<P>(
    WrappedComponent: React.FC<P> | React.ComponentClass<P>,
    customLocale?: ILocale,
    customMessages?: ITranslations,
): React.ComponentType<P> {
    class WithIntl extends React.Component<P> {
        public render() {
            const locale = customLocale ? customLocale : DefaultLocale;
            const messages = customMessages ? customMessages : messagesMap[locale as string];
            return (
                <IntlProvider locale={locale as string} messages={messages}>
                    <WrappedComponent {...this.props} />
                </IntlProvider>
            );
        }
    }

    return wrapDisplayName("withIntl", WrappedComponent)(WithIntl);
}

/**
 * Resolves parameter into {@link ILocale} or {@link DefaultLocale}.
 *
 * @param locale - value of the locale to check for support
 *
 * @internal
 */
export const resolveLocale = (locale: unknown): ILocale => {
    return isLocale(locale) ? locale : DefaultLocale;
};

/**
 * Returns a string meant to represent a header with an empty value.
 * @param intl - the source of i18n strings
 * @internal
 */
export function emptyHeaderTitleFromIntl(intl: IntlShape): string {
    return `(${intl.formatMessage({ id: "visualization.emptyValue" })})`;
}

/**
 * Returns a string meant to represent the total colum when it is empty.
 * @param intl - the source of i18n strings
 * @internal
 */
export function totalColumnTitleFromIntl(intl: IntlShape): string {
    return intl.formatMessage({ id: "visualization.waterfall.total" });
}
