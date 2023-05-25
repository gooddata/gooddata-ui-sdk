// (C) 2019-2022 GoodData Corporation
import React from "react";
import compose from "lodash/flowRight.js";
import { ITheme } from "@gooddata/sdk-model";
import { wrapDisplayName } from "@gooddata/sdk-ui";

const ThemeContext = React.createContext<ITheme | undefined>(undefined);
ThemeContext.displayName = "ThemeContext";

const ThemeIsLoadingContext = React.createContext<boolean | undefined>(undefined);
ThemeIsLoadingContext.displayName = "ThemeIsLoadingContext";

/**
 * @public
 */
export interface IThemeContextProviderProps {
    /**
     * Theme object contains properties to be used instead of default ones
     */
    theme: ITheme;

    /**
     * Flag telling whether the theme object is being loaded or not
     */
    themeIsLoading: boolean;

    /**
     * React children
     */
    children?: React.ReactNode;
}

/**
 * Provides the theme object and themeIsLoading flag into context
 *
 * @public
 */
export const ThemeContextProvider: React.FC<IThemeContextProviderProps> = ({
    children,
    theme,
    themeIsLoading,
}) => {
    return (
        <ThemeContext.Provider value={theme}>
            <ThemeIsLoadingContext.Provider value={themeIsLoading}>{children}</ThemeIsLoadingContext.Provider>
        </ThemeContext.Provider>
    );
};

/**
 * Hook for reaching the theme from context.
 *
 * @remarks
 * You can optionally set a theme override that will be returned if defined.
 * This makes the usage more ergonomic (see the following example).
 *
 * @example
 * ```
 * // instead of
 * const fromContext = useTheme();
 * const effectiveTheme = fromArguments ?? fromContext.
 * // you can write
 * const theme = useTheme(fromArguments);
 * ```
 *
 * @param theme - theme to use instead of context value. If undefined, the context value is used.
 * @public
 */
export const useTheme = (theme?: ITheme): ITheme | undefined => {
    const themeFromContext = React.useContext(ThemeContext);
    return theme ?? themeFromContext;
};

/**
 * Hook for reaching the themeIsLoading flag from context
 *
 * @public
 */
export const useThemeIsLoading = (): boolean | undefined => {
    return React.useContext(ThemeIsLoadingContext);
};

/**
 * @internal
 */
export function withThemeObject<T extends { theme?: ITheme; themeIsLoading?: boolean }>(
    Component: React.ComponentType<T>,
): React.ComponentType<Omit<T, "theme">> {
    const ComponentWithInjectedThemeObject: React.FC<T> = (props) => {
        return (
            <ThemeContext.Consumer>
                {(theme) => <Component {...props} theme={props.theme ?? theme} />}
            </ThemeContext.Consumer>
        );
    };

    return wrapDisplayName("withThemeObject", ThemeContextProvider)(ComponentWithInjectedThemeObject);
}

/**
 * @internal
 */
export function withThemeIsLoading<T extends { themeIsLoading?: boolean }>(
    Component: React.ComponentType<T>,
): React.ComponentType<Omit<T, "themeIsLoading">> {
    const ComponentWithInjectedThemeIsLoading: React.FC<T> = (props) => {
        return (
            <ThemeIsLoadingContext.Consumer>
                {(themeIsLoading) => <Component themeIsLoading={themeIsLoading} {...props} />}
            </ThemeIsLoadingContext.Consumer>
        );
    };

    return wrapDisplayName("withThemeIsLoading", ThemeContextProvider)(ComponentWithInjectedThemeIsLoading);
}

/**
 * Injects both theme object and isThemeLoading flag into component as properties
 *
 * @public
 */
export function withTheme<T extends { theme?: ITheme; workspace?: string }>(
    Component: React.ComponentType<T>,
): React.ComponentType<Omit<T, "theme" | "themeIsLoading">> {
    return compose(wrapDisplayName("withContexts"), withThemeObject, withThemeIsLoading)(Component);
}
