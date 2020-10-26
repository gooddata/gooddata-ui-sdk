// (C) 2019 GoodData Corporation
import React from "react";
import compose from "lodash/flowRight";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { wrapDisplayName } from "@gooddata/sdk-ui";

const ThemeContext = React.createContext<ITheme | undefined>(undefined);
ThemeContext.displayName = "ThemeContext";

const ThemeIsLoadingContext = React.createContext<boolean | undefined>(undefined);
ThemeIsLoadingContext.displayName = "ThemeIsLoadingContext";

/**
 * @beta
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
}

/**
 * Provides the theme object and themeIsLoading flag into context
 *
 * @beta
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
 * Hook for reaching the theme from context
 *
 * @beta
 */
export const useTheme = (): ITheme | undefined => {
    const theme = React.useContext(ThemeContext);
    return theme;
};

/**
 * Hook for reaching the themeIsLoading flag from context
 *
 * @beta
 */
export const useThemeIsLoading = (): boolean | undefined => {
    const themeIsLoading = React.useContext(ThemeIsLoadingContext);
    return themeIsLoading;
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
 * @beta
 */
export function withTheme<T extends { theme?: ITheme; workspace?: string }>(
    Chart: React.ComponentType<T>,
): React.ComponentType<Omit<T, "theme" | "themeIsLoading">> {
    return compose(wrapDisplayName("withContexts"), withThemeObject, withThemeIsLoading)(Chart);
}
