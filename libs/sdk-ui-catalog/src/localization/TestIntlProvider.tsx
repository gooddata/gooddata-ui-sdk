// (C) 2025 GoodData Corporation

import React from "react";

import { IntlProvider } from "react-intl";

import { translations } from "./translations.js";

/**
 * `IntlProvider` wrapper for use in tests.
 * @internal
 */
export function TestIntlProvider({ children }: React.PropsWithChildren) {
    return (
        <IntlProvider locale="en-US" messages={translations["en-US"]}>
            {children}
        </IntlProvider>
    );
}
