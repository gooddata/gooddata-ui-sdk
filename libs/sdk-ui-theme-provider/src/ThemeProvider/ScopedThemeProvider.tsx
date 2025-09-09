// (C) 2020-2025 GoodData Corporation

import React, { useEffect, useRef, useState } from "react";

import identity from "lodash/identity.js";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ITheme } from "@gooddata/sdk-model";
import { useBackend, useWorkspace } from "@gooddata/sdk-ui";

import { ThemeContextProvider, ThemeStatus } from "./Context.js";
import { isDarkTheme } from "./isDarkTheme.js";
import { prepareTheme } from "./prepareTheme.js";
import { ThemeModifier } from "./ThemeProvider.js";
import { clearCssProperties, setCssProperties } from "../cssProperties.js";

/**
 * @internal
 */
export interface IScopedThemeProviderProps {
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
 * ScopedThemeProvider is an experimental component that is not yet ready for production use.
 *
 * For full functionality, improvements are needed in how React Portals are handled.
 * Currently, components like dropdowns that render through portals appear outside the themed scope
 * and cannot properly access the scoped CSS variables since they exist outside the regular component tree.
 *
 * @internal
 */
export function ScopedThemeProvider({
    children,
    theme: themeParam,
    backend: backendParam,
    workspace: workspaceParam,
    modifier = identity,
    enableComplementaryPalette = true,
    removeGlobalStylesOnUnmout = true,
}: IScopedThemeProviderProps) {
    const backend = useBackend(backendParam);
    const workspace = useWorkspace(workspaceParam);

    const [scopeId] = useState(`font${Math.random().toString(36).substring(2, 15)}`);
    const [theme, setTheme] = useState(themeParam ?? {});
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<ThemeStatus>("pending");
    const [scope, setScope] = useState<HTMLElement | null>();

    const lastWorkspace = useRef<string>();
    lastWorkspace.current = workspace;

    useEffect(() => {
        // no need to load anything if the themeParam is present
        if (themeParam) {
            const preparedTheme = prepareTheme(themeParam, enableComplementaryPalette);
            setTheme(preparedTheme);
            setStatus("success");
            clearCssProperties(true, scope ?? undefined, scopeId);
            setCssProperties(preparedTheme, isDarkTheme(preparedTheme), true, scope ?? undefined, scopeId);
            return;
        }

        const fetchData = async () => {
            if (!backend || !workspace) {
                clearCssProperties(true, scope ?? undefined);
                return;
            }

            setIsLoading(true);
            setStatus("loading");
            const selectedTheme = await backend.workspace(workspace).styling().getTheme();

            if (lastWorkspace.current === workspace) {
                const modifiedTheme = modifier(selectedTheme);
                const preparedTheme = prepareTheme(modifiedTheme, enableComplementaryPalette);
                setTheme(preparedTheme);
                clearCssProperties(true, scope ?? undefined, scopeId);
                setCssProperties(
                    preparedTheme,
                    isDarkTheme(preparedTheme),
                    true,
                    scope ?? undefined,
                    scopeId,
                );
                setIsLoading(false);
                setStatus("success");
            }
        };

        fetchData();
    }, [themeParam, workspace, backend, modifier, enableComplementaryPalette, scope, scopeId]);

    useEffect(() => {
        return () => {
            if (removeGlobalStylesOnUnmout) {
                clearCssProperties(true, scope ?? undefined, scopeId);
            }
        };
    }, [removeGlobalStylesOnUnmout, scope, scopeId]);

    return (
        <ThemeContextProvider theme={theme} isScopeThemed themeIsLoading={isLoading} themeStatus={status}>
            <div
                ref={(el) => {
                    if (el) {
                        setScope(el);
                    } else {
                        setScope(null);
                    }
                }}
            >
                {children}
            </div>
        </ThemeContextProvider>
    );
}
