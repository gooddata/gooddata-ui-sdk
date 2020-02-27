// (C) 2007-2018 GoodData Corporation
import React from "react";
import { IntlProvider, createIntl } from "react-intl";
import { messagesMap } from "./IntlWrapper";
import { DefaultLocale } from "./Locale";

/**
 * @internal
 */
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
                <IntlProvider locale={DefaultLocale} messages={messagesMap[DefaultLocale]}>
                    <WrappedComponent {...this.props} />
                </IntlProvider>
            );
        }
    };
}
