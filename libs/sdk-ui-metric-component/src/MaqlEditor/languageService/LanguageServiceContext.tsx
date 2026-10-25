// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useEffect, useState } from "react";

import { MaqlLanguageService, MetadataService } from "@gooddata/sdk-maql-language-server";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useReloadMetrics } from "../../shared/metrics/useReloadMetrics.js";

export const LanguageServiceContext = createContext<MaqlLanguageService | undefined>(undefined);

/**
 * @internal
 */
export interface ILanguageServiceProviderProps {
    /**
     * Resolved value of the enableComputedAttributes workspace setting. When false, the language
     * service does not request computed attributes from the catalog (the backend refuses the
     * listing when the setting is off). Leave undefined when the host does not know the setting.
     */
    enableComputedAttributes?: boolean;
}

/**
 * @internal
 */
export function LanguageServiceProvider({
    children,
    enableComputedAttributes,
}: PropsWithChildren<ILanguageServiceProviderProps>) {
    const [languageServiceData, setLanguageService] = useState<MaqlLanguageService | undefined>();
    const { metricReloadRequest } = useReloadMetrics();
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    useEffect(() => {
        const metadataService = MetadataService.withBackend(workspaceId, backend, {
            enableComputedAttributes,
        });
        setLanguageService(new MaqlLanguageService(undefined, metadataService));
    }, [backend, workspaceId, metricReloadRequest, enableComputedAttributes]);

    return (
        <LanguageServiceContext.Provider value={languageServiceData}>
            {children}
        </LanguageServiceContext.Provider>
    );
}
