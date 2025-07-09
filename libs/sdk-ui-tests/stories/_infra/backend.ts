// (C) 2007-2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    compositeBackend,
    CompositeBackendPart,
    recordedBackend,
    RecordedBackendConfig,
} from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";

export const ReferenceWorkspaceId = "reference-workspace";

export function StorybookBackend(config: RecordedBackendConfig = {}): IAnalyticalBackend {
    const reference: CompositeBackendPart = {
        workspace: ReferenceWorkspaceId,
        backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings, config)),
    };

    return compositeBackend(reference);
}
