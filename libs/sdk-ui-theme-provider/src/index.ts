// (C) 2020-2025 GoodData Corporation
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
export type { IThemeProviderProps, ThemeModifier } from "./ThemeProvider/ThemeProvider.js";
export { ThemeProvider } from "./ThemeProvider/ThemeProvider.js";
export { ScopedThemeProvider } from "./ThemeProvider/ScopedThemeProvider.js";
export { ConditionalScopedThemeProvider } from "./ThemeProvider/ConditionalScopedThemeProvider.js";
export { isDarkTheme } from "./ThemeProvider/isDarkTheme.js";
export type { IScopedThemeProviderProps } from "./ThemeProvider/ScopedThemeProvider.js";
export type { IThemeContextProviderProps, ThemeStatus } from "./ThemeProvider/Context.js";
export {
    withTheme,
    useTheme,
    useThemeIsLoading,
    useIsScopeThemed,
    useThemeStatus,
    useIsDarkTheme,
    ThemeContextProvider,
} from "./ThemeProvider/Context.js";
