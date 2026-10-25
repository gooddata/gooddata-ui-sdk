// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { IntlProvider, createIntl } from "react-intl";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "./translations.js";

const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

export function getIntlOptions(mockTranslations = {}) {
    return {
        locale: "en-US",
        messages: {
            ...messages,
            ...mockTranslations,
        },
    };
}

export function withIntl<T>(
    WrappedComponent: ComponentType<T>,
    intlOptions = getIntlOptions(),
): ComponentType<T> {
    function WithIntl(props: T) {
        return (
            <IntlProvider {...intlOptions}>
                <WrappedComponent {...props} />
            </IntlProvider>
        );
    }

    return WithIntl;
}

export const mockIntlProp = (mockTranslations = {}) => createIntl(getIntlOptions(mockTranslations));
