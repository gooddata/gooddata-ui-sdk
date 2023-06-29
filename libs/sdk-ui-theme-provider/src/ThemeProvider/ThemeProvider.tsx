// (C) 2020-2022 GoodData Corporation
import React, { useEffect, useState, useRef } from "react";
import { getLuminance } from "polished";
import identity from "lodash/identity.js";
import { useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ITheme } from "@gooddata/sdk-model";

import { clearCssProperties, setCssProperties } from "../cssProperties.js";
import { ThemeContextProvider } from "./Context.js";
import { prepareTheme } from "./prepareTheme.js";

/**
 * @public
 */
export type ThemeModifier = (theme: ITheme) => ITheme;

/**
 * @public
 */
export interface IThemeProviderProps {
    /**
     * Theme that will be used if defined.
     *
     * @remarks
     * If not defined here, the theme will be obtained from the backend.
     *
     * Note: either the theme or both backend and workspace MUST be provided (either directly or via their contexts).
     */
    theme?: ITheme;

    /**
     * Analytical backend, from which the ThemeProvider will obtain selected theme object.
     *
     * @remarks
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the ThemeProvider will obtain the selected theme identifier
     *
     * @remarks
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;

    /**
     * If provided it is called with loaded theme to allow its modification according to the app needs.
     */
    modifier?: ThemeModifier;

    /**
     * Flag determining whether the complementary palette is enabled or not.
     *
     * @remarks
     * If set to false, complementary palette is discarded.
     * Useful for applications not yet fully supporting dark-based themes achievable with the complementary palette.
     */
    enableComplementaryPalette?: boolean;

    /**
     * Should ThemeProvider remove global styles during the unmount phase?
     *
     * Default: true
     */
    removeGlobalStylesOnUnmout?: boolean;

    /**
     * React children
     */
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const isDarkTheme = (theme: ITheme): boolean => {
    const firstColor = theme?.palette?.complementary?.c0;
    const lastColor = theme?.palette?.complementary?.c9;

    if (!firstColor || !lastColor) {
        return false;
    }

    return getLuminance(firstColor) < getLuminance(lastColor);
};

/**
 * Fetches the theme object from the backend upon mounting and passes both theme object and isThemeLoading flag
 * to the context via ThemeContextProvider.
 *
 * @remarks
 * Converts properties from theme object into CSS variables and injects them into <body> via setCssProperties
 *
 * Both backend and workspace can be passed as an arguments, otherwise the component tries to get these from the context
 *
 * @public
 */
export const ThemeProvider: React.FC<IThemeProviderProps> = ({
    children,
    theme: themeParam,
    backend: backendParam,
    workspace: workspaceParam,
    modifier = identity,
    enableComplementaryPalette = true,
    removeGlobalStylesOnUnmout = true,
}) => {
    const backend = useBackend(backendParam);
    const workspace = useWorkspace(workspaceParam);

    const [theme, setTheme] = useState(themeParam ?? {});
    const [isLoading, setIsLoading] = useState(false);

    const lastWorkspace = useRef<string>();
    lastWorkspace.current = workspace;

    useEffect(() => {
        // no need to load anything if the themeParam is present
        if (themeParam) {
            const preparedTheme = prepareTheme(themeParam, enableComplementaryPalette);
            setTheme(preparedTheme);
            clearCssProperties();
            setCssProperties(preparedTheme, isDarkTheme(preparedTheme));
            return;
        }

        const fetchData = async () => {
            if (!backend || !workspace) {
                clearCssProperties();
                return;
            }

            setIsLoading(true);
            const selectedTheme = await backend.workspace(workspace).styling().getTheme();

            if (lastWorkspace.current === workspace) {
                const modifiedTheme = modifier(selectedTheme);
                const preparedTheme = prepareTheme(modifiedTheme, enableComplementaryPalette);
                setTheme(preparedTheme);
                clearCssProperties();
                setCssProperties(preparedTheme, isDarkTheme(preparedTheme));
                setIsLoading(false);
            }
        };

        fetchData();
    }, [themeParam, workspace, backend, modifier, enableComplementaryPalette]);

    useEffect(() => {
        return () => {
            if (removeGlobalStylesOnUnmout) {
                clearCssProperties();
            }
        };
    }, [removeGlobalStylesOnUnmout]);

    return (
        <ThemeContextProvider theme={theme} themeIsLoading={isLoading}>
            {children}
        </ThemeContextProvider>
    );
};
