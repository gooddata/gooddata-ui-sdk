// (C) 2020-2024 GoodData Corporation
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
    IThemeProviderProps,
    ThemeProvider,
    ThemeModifier,
    isDarkTheme,
} from "./ThemeProvider/ThemeProvider.js";
export {
    IThemeContextProviderProps,
    withTheme,
    useTheme,
    useThemeIsLoading,
    useThemeStatus,
    ThemeContextProvider,
    ThemeStatus,
} from "./ThemeProvider/Context.js";
