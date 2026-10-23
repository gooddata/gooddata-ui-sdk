// (C) 2021-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type InitializeResult } from "vscode-languageserver";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

export function useLanguageServiceInitializer(
    languageService: MaqlLanguageService | undefined,
): InitializeResult | undefined {
    const [initializeData, setInitializeData] = useState<InitializeResult | undefined>();

    useEffect(() => {
        if (languageService) {
            setInitializeData(languageService.initialize());
        }
    }, [languageService, setInitializeData]);

    return initializeData;
}
