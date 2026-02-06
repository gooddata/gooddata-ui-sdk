// (C) 2020-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * This package provides tools to make your application support themes.
 *
 * @remarks
 * A theme allows you to change the colors, fonts and other visual aspects of GoodData.UI components.
 * You can use functions in this package to set a theme for a subtree of your React component tree
 * and to make your own components able to consume the theme provided.
 *
 * @packageDocumentation
 */
export {
    ThemeProvider,
    type IThemeProviderProps,
    type ThemeModifier,
} from "./ThemeProvider/ThemeProvider.js";
export { ScopedThemeProvider, type IScopedThemeProviderProps } from "./ThemeProvider/ScopedThemeProvider.js";
export { ConditionalScopedThemeProvider } from "./ThemeProvider/ConditionalScopedThemeProvider.js";
export { isDarkTheme } from "./ThemeProvider/isDarkTheme.js";
export {
    withTheme,
    useTheme,
    useThemeIsLoading,
    useIsScopeThemed,
    useThemeStatus,
    useIsDarkTheme,
    ThemeContextProvider,
    type IThemeContextProviderProps,
    type ThemeStatus,
} from "./ThemeProvider/Context.js";
