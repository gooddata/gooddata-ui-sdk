// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IntlProvider, createIntl, IntlShape } from "react-intl";
import { ITranslations, messagesMap } from "./messagesMap";
import { DefaultLocale, ILocale, isLocale } from "./Locale";
import { wrapDisplayName } from "../react/wrapDisplayName";

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
