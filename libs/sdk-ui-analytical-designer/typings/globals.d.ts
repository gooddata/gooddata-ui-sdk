// (C) 2007-2026 GoodData Corporation

import type { ISettings } from "@gooddata/sdk-model";

import type { SemanticCfSimConfig } from "../src/semanticCfSimulation.js";

declare global {
    const TESTING: boolean;
    const DEBUG: boolean;
    const READONLY_MODE: boolean;
    const TIGER_API_TOKEN: string | undefined;
    const MAPBOX_TOKEN: string | undefined;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        COMMITHASH: string;
        /** settings an embedder may inject to override the workspace ones */
        customWorkspaceSettings?: ISettings;
        // Dev-only: set before the app loads to fake semantic-layer conditional formatting on
        // execution-result headers (the real backend doesn't emit these fields yet). See
        // src/semanticCfSimulation.ts.
        semanticCfSimConfig?: SemanticCfSimConfig;
        // this variable is set before e2e and change bucket identifiers to be deterministic for recording snapshots
        useSafeBucketItemIdentifiersForE2e: boolean;
    }
}
