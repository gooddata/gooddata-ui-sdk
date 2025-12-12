// (C) 2007-2025 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import {
    type CompositeBackendPart,
    type RecordedBackendConfig,
    compositeBackend,
    recordedBackend,
} from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export const ReferenceWorkspaceId = "reference-workspace";

export function StorybookBackend(config: RecordedBackendConfig = {}): IAnalyticalBackend {
    const reference: CompositeBackendPart = {
        workspace: ReferenceWorkspaceId,
        backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings, config)),
    };

    return compositeBackend(reference);
}
