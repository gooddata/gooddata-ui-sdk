// (C) 2025 GoodData Corporation

import { ReactNode } from "react";
import { useIsScopeThemed, useTheme } from "./Context.js";
import { ScopedThemeProvider } from "./ScopedThemeProvider.js";

/**
 * This component is used to wrap portal rendered components that are not part of the regular component tree
 * to ensure that the scoped theme is applied.
 *
 * @internal
 */
export function ConditionalScopedThemeProvider({ children }: { children: ReactNode }) {
    const theme = useTheme();
    const isScopeThemed = useIsScopeThemed();

    return theme && isScopeThemed ? (
        <ScopedThemeProvider theme={theme}>{children}</ScopedThemeProvider>
    ) : (
        children
    );
}
