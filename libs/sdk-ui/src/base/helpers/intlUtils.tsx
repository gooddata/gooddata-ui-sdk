// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IntlProvider, createIntl } from "react-intl";
import { messagesMap } from "../translations/IntlWrapper";
import { DEFAULT_LOCALE } from "../constants/localization";

export function createIntlMock(customMessages = {}) {
    return createIntl({
        locale: "en-US",
        messages: {
            ...messagesMap["en-US"],
            ...customMessages,
        },
    });
}

export function withIntl<P>(
    WrappedComponent: React.FC<P> | React.ComponentClass<P>,
): React.ComponentClass<P> {
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
