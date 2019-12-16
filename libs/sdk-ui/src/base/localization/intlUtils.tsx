// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IntlProvider } from "react-intl";
import { messagesMap } from "./IntlWrapper";
import { DefaultLocale } from "./Locale";

/**
 * @internal
 */
export function createIntlMock(customMessages = {}) {
    const intlProvider = new IntlProvider(
        {
            locale: "en-US",
            messages: {
                ...messagesMap["en-US"],
                ...customMessages,
            },
        },
        {},
    );
    const { intl } = intlProvider.getChildContext();
    return intl;
}

/**
 * @public
 */
export function withIntl<P>(WrappedComponent: React.ComponentClass<P>): React.ComponentClass<P> {
    return class extends React.Component<P> {
        public render() {
            return (
                <IntlProvider locale={DefaultLocale} messages={messagesMap[DefaultLocale]}>
                    <WrappedComponent {...this.props} />
                </IntlProvider>
            );
        }
    };
}
