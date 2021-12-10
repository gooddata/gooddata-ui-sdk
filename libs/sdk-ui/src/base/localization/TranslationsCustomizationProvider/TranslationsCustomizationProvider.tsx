// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import React, { useEffect, useState } from "react";
import { useBackend } from "../../react/BackendContext";
import { useWorkspace } from "../../react/WorkspaceContext";
import { TranslationsCustomizationContextProvider } from "./Context";
import { getWorkspaceSettingsLoader } from "./workspaceSettingsLoader";
import { pickCorrectWording } from "./utils";

declare global {
    interface Window {
        gdSettings: IWorkspaceSettings | undefined;
    }
}

/**
 * @beta
 */
export interface ITranslationsCustomizationProviderProps {
    /**
     * Component that will be render (Render Props pattern).
     */
    render(translations: Record<string, string>): JSX.Element;

    /**
     * Customization function that will change final translations.
     */
    customize?(translations: Record<string, string>, settings?: IWorkspaceSettings): Record<string, string>;

    /**
     * Translations that needs to be modified.
     */
    translations: Record<string, string>;

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

const defaultTranslationsParam: ITranslationsCustomizationProviderProps["translations"] = {};

/**
 * This provider is here because of the need for customization of translations.
 * If you need to change translations based on some setting flag,
 * use this provider at the top of you your react tree.
 *
 * You can see that the provider accepts render function and customize function as parameters.
 * Using these two function you can customize your translations.
 *
 * @beta
 */
export const TranslationsCustomizationProvider: React.FC<ITranslationsCustomizationProviderProps> = ({
    render,
    customize = pickCorrectWording,
    translations: translationsParam = defaultTranslationsParam,
    backend: backendParam,
    workspace: workspaceParam,
}) => {
    const backend = useBackend(backendParam);
    const workspace = useWorkspace(workspaceParam);
    const [translations, setTranslations] = useState(() => customize(translationsParam));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!backend || !workspace) {
                return;
            }
            setIsLoading(true);

            /**
             * Load the settings using a centralized loader with cache to prevent duplicate network requests.
             */
            const loader = getWorkspaceSettingsLoader();
            const settings = await loader.load(backend, workspace);

            /**
             * Because of issues described in the ticket FET-855, we decided to use this workaround.
             * After the issues that are described in the ticket are solved or at least reduced,
             * this workaround can be removed.
             */
            window.gdSettings = settings;
            setTranslations(customize(translationsParam, settings));
            setIsLoading(false);
        };

        fetchSettings();
    }, [backend, workspace, translationsParam]);

    return (
        <TranslationsCustomizationContextProvider
            translationsCustomizationIsLoading={isLoading}
            translations={translations}
        >
            {render(translations)}
        </TranslationsCustomizationContextProvider>
    );
};
