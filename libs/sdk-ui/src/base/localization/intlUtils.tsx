// (C) 2007-2018 GoodData Corporation
import React from "react";
import { IntlProvider, createIntl, IntlShape } from "react-intl";
import { messagesMap } from "./IntlWrapper";
import { DefaultLocale } from "./Locale";
import { wrapDisplayName } from "../react/wrapDisplayName";

/**
 * @internal
 */
export function createIntlMock(customMessages = {}): IntlShape {
    return createIntl({
        locale: "en-US",
        messages: {
            ...messagesMap["en-US"],
            ...customMessages,
        },
    });
}

export function withIntl<P>(WrappedComponent: React.FC<P> | React.ComponentClass<P>): React.ComponentType<P> {
    class WithIntl extends React.Component<P> {
        public render() {
            return (
                <IntlProvider locale={DefaultLocale} messages={messagesMap[DefaultLocale]}>
                    <WrappedComponent {...this.props} />
                </IntlProvider>
            );
        }
    }

    return wrapDisplayName("withIntl", WrappedComponent)(WithIntl);
}
