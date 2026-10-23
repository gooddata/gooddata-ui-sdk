// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useMemo } from "react";

import { type DefaultTheme, defaultTheme } from "./default.js";

export const ThemeContext = createContext<DefaultTheme>(defaultTheme());

export function ThemeProvider({ theme, children }: PropsWithChildren<{ theme?: DefaultTheme | null }>) {
    const def = useMemo(() => defaultTheme(), []);

    return <ThemeContext.Provider value={theme || def}>{children}</ThemeContext.Provider>;
}
