// (C) 2021-2026 GoodData Corporation

import { useContext, useEffect, useState } from "react";

import { MaqlLanguageService, MetadataService } from "@gooddata/sdk-maql-language-server";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { LanguageServiceContext } from "../../languageService/LanguageServiceContext.js";

export function useLanguageService(): MaqlLanguageService | undefined {
    const contextService = useContext(LanguageServiceContext);
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    const [languageService, setLanguageService] = useState<MaqlLanguageService | undefined>();

    useEffect(() => {
        if (contextService) {
            setLanguageService(contextService);
        } else {
            const metadataService = MetadataService.withBackend(workspaceId, backend);
            setLanguageService(new MaqlLanguageService(undefined, metadataService));
        }
    }, [contextService, backend, workspaceId]);

    return languageService;
}
