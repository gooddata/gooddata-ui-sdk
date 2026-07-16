// (C) 2019-2026 GoodData Corporation

import { type ComponentType, type ReactNode, createContext, useContext } from "react";

import { type ITheme } from "@gooddata/sdk-model";
import { wrapDisplayName } from "@gooddata/sdk-ui";

import { isDarkTheme } from "./isDarkTheme.js";

const ThemeContext = createContext<ITheme | undefined>(undefined);
ThemeContext.displayName = "ThemeContext";

const ThemeReferenceContext = createContext<ITheme | undefined>(undefined);
ThemeReferenceContext.displayName = "ThemeReferenceContext";

const ThemeIsLoadingContext = createContext<boolean | undefined>(undefined);
ThemeIsLoadingContext.displayName = "ThemeIsLoadingContext";

const ThemeIsScopeThemedContext = createContext<boolean | undefined>(undefined);
ThemeIsScopeThemedContext.displayName = "ThemeIsScopeThemedContext";

const ThemeStatusContext = createContext<ThemeStatus | undefined>("pending");
ThemeStatusContext.displayName = "ThemeStatusContext";

/**
 * @public
 */
export type ThemeStatus = "pending" | "loading" | "success";

/**
 * @public
 */
export interface IThemeContextProviderProps {
    /**
     * Theme object contains properties to be used instead of default ones.
     * When undefined, no theme is applied and default styling is used.
     */
    theme: ITheme | undefined;

    /**
     * Theme of record for computations that must not depend on application-specific
     * presentation adjustments (e.g. a stripped complementary palette).
     *
     * @remarks
     * When undefined, the reference from an enclosing provider is inherited,
     * falling back to the theme itself.
     */
    referenceTheme?: ITheme;

    /**
     * Flag telling whether the theme object is being loaded or not
     * @deprecated use themeStatus instead
     *
     */
    themeIsLoading: boolean;

    /**
     * Status telling whether the theme object is being loaded or not
     * Started in pending state, then switches to loading and finally to success
     * Can skip loading if theme does not have to be loaded from backend
     *
     */
    themeStatus?: ThemeStatus;

    /**
     * Whether the theme object comes from ScopedThemeProvider
     */
    isScopeThemed?: boolean;

    /**
     * React children
     */
    children?: ReactNode;
}

/**
 * Provides the theme object, themeIsLoading flag and themeStatus into context
 *
 * @public
 */
export function ThemeContextProvider({
    children,
    theme,
    referenceTheme,
    themeIsLoading,
    themeStatus,
    isScopeThemed,
}: IThemeContextProviderProps) {
    // nested providers re-providing only the presentation theme must not shadow
    // an outer reference theme (e.g. chart internals re-wrap the stripped theme in AD)
    const outerReferenceTheme = useContext(ThemeReferenceContext);
    return (
        <ThemeContext.Provider value={theme}>
            <ThemeReferenceContext.Provider value={referenceTheme ?? outerReferenceTheme ?? theme}>
                <ThemeIsLoadingContext.Provider value={themeIsLoading}>
                    <ThemeIsScopeThemedContext.Provider value={isScopeThemed}>
                        <ThemeStatusContext.Provider value={themeStatus}>
                            {children}
                        </ThemeStatusContext.Provider>
                    </ThemeIsScopeThemedContext.Provider>
                </ThemeIsLoadingContext.Provider>
            </ThemeReferenceContext.Provider>
        </ThemeContext.Provider>
    );
}

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
    const themeFromContext = useContext(ThemeContext);
    return theme ?? themeFromContext;
};

/**
 * Hook for reaching the reference theme from context.
 *
 * @remarks
 * The reference theme is the workspace theme prepared with the complementary palette enabled,
 * regardless of how the application presents itself. Use it for computations that must be
 * consistent across applications (e.g. color derivation); use {@link useTheme} for presentation.
 *
 * @public
 */
export const useReferenceTheme = (): ITheme | undefined => {
    return useContext(ThemeReferenceContext);
};

/**
 * Hook that returns whether the current theme is dark
 *
 * @public
 */
export const useIsDarkTheme = (): boolean => {
    const theme = useTheme();
    return isDarkTheme(theme);
};

/**
 * Hook for reaching the themeIsLoading flag from context
 *
 * @public
 */
export const useThemeIsLoading = (): boolean | undefined => {
    return useContext(ThemeIsLoadingContext);
};

/**
 * Hook for reaching the themeStatus from context
 *
 * @public
 */
export const useThemeStatus = (): ThemeStatus | undefined => {
    return useContext(ThemeStatusContext);
};

/**
 * Hook for reaching the isScopeThemed flag from context
 *
 * @internal
 */
export const useIsScopeThemed = (): boolean | undefined => {
    return useContext(ThemeIsScopeThemedContext);
};

/**
 * @internal
 */
export function withThemeObject<T extends { theme?: ITheme; themeIsLoading?: boolean }>(
    Component: ComponentType<T>,
): ComponentType<Omit<T, "theme">> {
    function ComponentWithInjectedThemeObject(props: Omit<T, "theme">) {
        return (
            <ThemeContext.Consumer>
                {(theme) => <Component {...(props as T)} theme={theme} />}
            </ThemeContext.Consumer>
        );
    }

    return wrapDisplayName("withThemeObject", ThemeContextProvider)(ComponentWithInjectedThemeObject);
}

/**
 * @internal
 */
export function withThemeIsLoading<T extends { themeIsLoading?: boolean }>(
    Component: ComponentType<T>,
): ComponentType<Omit<T, "themeIsLoading">> {
    function ComponentWithInjectedThemeIsLoading(props: Omit<T, "themeIsLoading">) {
        return (
            <ThemeIsLoadingContext.Consumer>
                {(themeIsLoading) => <Component {...(props as T)} themeIsLoading={themeIsLoading} />}
            </ThemeIsLoadingContext.Consumer>
        );
    }

    return wrapDisplayName("withThemeIsLoading", ThemeContextProvider)(ComponentWithInjectedThemeIsLoading);
}

/**
 * @internal
 */
export function withThemeStatus<T extends { themeStatus?: ThemeStatus }>(
    Component: ComponentType<T>,
): ComponentType<Omit<T, "themeStatus">> {
    function ComponentWithInjectedThemeStatus(props: Omit<T, "themeStatus">) {
        return (
            <ThemeStatusContext.Consumer>
                {(themeStatus) => <Component {...(props as T)} themeStatus={themeStatus} />}
            </ThemeStatusContext.Consumer>
        );
    }

    return wrapDisplayName("withThemeStatus", ThemeContextProvider)(ComponentWithInjectedThemeStatus);
}

/**
 * Injects both theme object and isThemeLoading flag into component as properties
 *
 * @public
 */
export function withTheme<T extends { theme?: ITheme; workspace?: string }>(
    Component: ComponentType<T>,
): ComponentType<Omit<T, "theme" | "themeIsLoading" | "themeStatus">> {
    return wrapDisplayName("withContexts")(
        withThemeObject(withThemeIsLoading(withThemeStatus(Component as any))),
    ) as ComponentType<Omit<T, "theme" | "themeIsLoading" | "themeStatus">>;
}
