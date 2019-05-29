// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IntlProvider } from "react-intl";
import { messagesMap } from "../../core/base/IntlWrapper";
import { DEFAULT_LOCALE } from "../../../constants/localization";

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

export function wrapWithIntl(children: any) {
    return (
        <IntlProvider locale={DEFAULT_LOCALE} messages={messagesMap[DEFAULT_LOCALE]}>
            {React.cloneElement(children)}
        </IntlProvider>
    );
}

export function withIntl<P>(WrappedComponent: React.ComponentClass<P>): React.ComponentClass<P> {
    return class extends React.Component<P> {
        public render() {
            return (
                <IntlProvider locale={DEFAULT_LOCALE} messages={messagesMap[DEFAULT_LOCALE]}>
                    <WrappedComponent {...this.props} />
                </IntlProvider>
            );
        }
    };
}
