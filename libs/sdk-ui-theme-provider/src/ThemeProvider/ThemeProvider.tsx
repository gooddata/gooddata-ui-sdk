// (C) 2020 GoodData Corporation
import React, { useEffect, useState, useRef } from "react";
import { useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { clearCssProperties, setCssProperties } from "../cssProperties";
import { ThemeContextProvider } from "./Context";

/**
 *
 * @beta
 */
export interface IThemeProviderProps {
    /**
     * Theme object to use. If not specified, provider will load theme from workspace. If specified, backend and workspace props are ignored and don't have to be provided.
     */
    theme?: ITheme;
    /**
     * Analytical backend, from which the ThemeProvider will obtain selected theme object
     *
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the ThemeProvider will obtain the selected theme identifier
     *
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;
}

/**
 * Fetches the theme object from the backend upon mounting and passes both theme object and isThemeLoading flag
 * to the context via ThemeContextProvider
 *
 * Converts properties from theme object into CSS variables and injects them into <body> via setCssProperties
 *
 * Both backend and workspace can be passed as an arguments, otherwise the component tries to get these from the context
 *
 * @beta
 */
export const ThemeProvider: React.FC<IThemeProviderProps> = ({
    children,
    theme: themeParam,
    backend: backendParam,
    workspace: workspaceParam,
}) => {
    const backendFromContext = useBackend();
    const backend = backendParam || backendFromContext;
    const workspaceFromContext = useWorkspace();
    const workspace = workspaceParam || workspaceFromContext;

    const [theme, setTheme] = useState<ITheme>(themeParam ?? {});
    const [isLoading, setIsLoading] = useState(false);

    const lastWorkspace = useRef<string>();
    lastWorkspace.current = workspace;

    useEffect(() => {
        clearCssProperties();
        // no need to load anything if the themeParam is present
        if (themeParam) {
            setCssProperties(themeParam);
            return;
        }

        const fetchData = async () => {
            if (!backend || !workspace) {
                return;
            }

            setIsLoading(true);
            const selectedTheme = await backend.workspace(workspace).styling().getTheme();
            if (lastWorkspace.current === workspace) {
                setTheme(selectedTheme);
                setIsLoading(false);
                setCssProperties(selectedTheme);
            }
        };

        fetchData();
    }, [themeParam, workspace, backend]);

    useEffect(() => {
        return () => {
            clearCssProperties();
        };
    }, []);

    return (
        <ThemeContextProvider theme={theme} themeIsLoading={isLoading}>
            {children}
        </ThemeContextProvider>
    );
};
