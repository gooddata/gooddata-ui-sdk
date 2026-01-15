// (C) 2007-2026 GoodData Corporation

import {
    type ComponentClass,
    type ComponentType,
    type FC,
    type JSX,
    type ReactNode,
    useEffect,
    useState,
} from "react";

import { IntlProvider, type IntlShape, createIntl } from "react-intl";
import type { IntlConfig } from "react-intl/src/types.js";

import { DefaultLocale, type ILocale, isLocale } from "./Locale.js";
import { DEFAULT_MESSAGES, type ITranslations, resolveMessages } from "./messagesMap.js";
import { wrapDisplayName } from "../react/wrapDisplayName.js";

/**
 * @internal
 */
export function useResolveMessages(
    locale: ILocale,
    resolveMessages: (locale: string) => Promise<ITranslations>,
    defaultMessages: Record<string, ITranslations>,
): Record<string, ITranslations> {
    const [messages, setMessages] = useState<Record<string, ITranslations>>(defaultMessages);
    useEffect(() => {
        if (messages[locale]) {
            return;
        }

        void resolveMessages(locale).then((messages) => {
            setMessages((current) => ({ ...current, [locale]: messages }));
        });
        // we don't want to re-run this effect when the messages change its used as guard
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale, resolveMessages]);

    return messages;
}

/**
 * @internal
 */
export function createIntlMock(customMessages = {}, locale = "en-US"): IntlShape {
    return createIntl({
        locale,
        messages: {
            ...resolveLocaleDefaultMessages("en-US", DEFAULT_MESSAGES), // there's nothing more than default en-US in the map
            ...customMessages,
        },
        // Suppress MISSING_TRANSLATION errors in test environments
        onError: (error) => {
            // Only log non-MISSING_TRANSLATION errors
            if (!error.message?.includes("MISSING_TRANSLATION")) {
                //console.warn("IntlMock error:", error);
            }
        },
    });
}

/**
 * @internal
 */
export function withIntlForTest<P>(
    WrappedComponent: FC<P> | ComponentClass<P>,
    customLocale?: ILocale,
    customMessages?: ITranslations,
): ComponentType<P> {
    function WithIntl(props: P) {
        const locale = customLocale || DefaultLocale;
        const messages = useResolveMessages(locale, resolveMessages, DEFAULT_MESSAGES);

        const effectiveMessages = customMessages || messages[locale];
        if (!effectiveMessages) {
            return null;
        }

        return (
            <IntlProvider
                locale={locale as string}
                messages={effectiveMessages}
                onError={(error) => {
                    // Suppress MISSING_TRANSLATION errors to improve test performance
                    if (!error.message?.includes("MISSING_TRANSLATION")) {
                        console.warn("IntlProviderForTest error:", error);
                    }
                }}
            >
                <WrappedComponent {...(props as P & JSX.IntrinsicAttributes)} />
            </IntlProvider>
        );
    }

    return wrapDisplayName("withIntl", WrappedComponent)(WithIntl);
}

/**
 * @internal
 */
export function withIntl<P>(
    WrappedComponent: FC<P> | ComponentClass<P>,
    customLocale?: ILocale,
    customMessages?: ITranslations,
): ComponentType<P> {
    function WithIntl(props: P) {
        const locale = customLocale || DefaultLocale;
        const messages = useResolveMessages(locale, resolveMessages, DEFAULT_MESSAGES);
        const effectiveMessages = customMessages || messages[locale];
        if (!effectiveMessages) {
            return null;
        }

        return (
            <IntlProvider locale={locale as string} messages={effectiveMessages}>
                <WrappedComponent {...(props as P & JSX.IntrinsicAttributes)} />
            </IntlProvider>
        );
    }

    return wrapDisplayName("withIntl", WrappedComponent)(WithIntl);
}

/**
 * @internal
 */
export function Intl({
    children,
    customLocale,
    customMessages,
    forTest = false,
}: {
    children: ReactNode;
    customLocale?: ILocale;
    customMessages?: ITranslations;
    forTest?: boolean;
}) {
    const locale = customLocale ?? DefaultLocale;
    const messages = useResolveMessages(locale, resolveMessages, DEFAULT_MESSAGES);
    const effectiveMessages = customMessages || messages[locale];
    if (!effectiveMessages) {
        return null;
    }

    const props: IntlConfig = { locale, messages: effectiveMessages };

    if (forTest) {
        // this pattern is used, because sometimes, passing undefined can bypass the defaultProp in the other component,
        // in this case IntlProvider, which would mean that our onError function will be undefined, which is not ideal.

        props.onError = (error) => {
            if (!error.message?.includes("MISSING_TRANSLATION")) {
                console.warn("IntlProvider test error:", error);
            }
        };
    }

    return <IntlProvider {...props}>{children}</IntlProvider>;
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
 * This method try to resolve translations for the given locale.
 * If the locale is not found or is invalid, it will return the translations for default locale.
 * @param locale - input locale
 * @param messagesMap - map of messages
 * @returns resolved messages
 *
 * @internal
 */
export const resolveLocaleDefaultMessages = (
    locale: string,
    messagesMap: { [locale: string]: ITranslations },
) => {
    const strings = messagesMap[locale];
    if (!strings) {
        console.warn(`Missing locale strings for ${locale}, using ${DefaultLocale}`);
        return messagesMap[DefaultLocale];
    }

    return strings;
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

/**
 * Returns a string meant to represent a cluster group.
 * @param intl - the source of i18n strings
 * @internal
 */
export function clusterTitleFromIntl(intl: IntlShape): string {
    return intl.formatMessage({ id: "visualization.cluster" });
}
